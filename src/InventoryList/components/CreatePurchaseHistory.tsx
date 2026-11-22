import React, { useEffect } from "react";
import {
  Form,
  InputNumber,
  DatePicker,
  Select,
  Button,
  type FormProps,
  message,
} from "antd";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_PURCHASE_HISTORY } from "../graphql/mutations";
import {
  FETCH_ALL_ITEMS,
  FETCH_ALL_VENDORS,
  FETCH_LATEST_PURCHASE_BY_ITEM,
} from "../graphql/queries";
import type { Dayjs } from "dayjs";
import {
  formStyles,
  Section,
  SectionTitle,
  SectionHint,
  Grid,
  FullRow,
  ActionBar,
  SubmitButton,
} from "../../components/FormLayout";

interface FormTypes {
  quantity: number;
  unit_price?: number;
  purchase_date?: Dayjs | null;
  vendor?: string;
}
interface VendorTypes {
  name: string;
  vendorId: string;
}

const StyledForm = styled(Form<FormTypes>)`
  ${formStyles}
`;

const TotalBox = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 15px;
  border-radius: 10px;
  background: rgba(128, 128, 128, 0.08);
  font-size: 14px;
  font-weight: 500;

  strong {
    font-size: 18px;
    font-weight: 600;
  }
`;

interface Props {
  selectedItemId: string;
  setRestockModal: (state: boolean) => void;
}

const CreatePurchaseHistory: React.FC<Props> = ({
  selectedItemId,
  setRestockModal,
}) => {
  const [form] = Form.useForm<FormTypes>();
  const { data: vendorData, loading: vendorsLoading } =
    useQuery(FETCH_ALL_VENDORS);
  const [createPurchase, { loading, error }] = useMutation(
    CREATE_PURCHASE_HISTORY,
    {
      refetchQueries: [
        { query: FETCH_ALL_ITEMS, variables: { skip: 0, take: 500 } },
      ],
      awaitRefetchQueries: true,
    },
  );
  const { data: purchaseData } = useQuery(FETCH_LATEST_PURCHASE_BY_ITEM, {
    variables: { itemID: selectedItemId },
  });
  const itemHistoryData = purchaseData?.purchaseHistory;

  // Prefill from the latest purchase of this item (once the data arrives).
  useEffect(() => {
    if (itemHistoryData) {
      form.setFieldsValue({
        quantity: itemHistoryData.quantity,
        unit_price: Number(itemHistoryData.unit_price),
        vendor: itemHistoryData.vendorId,
      });
    }
  }, [itemHistoryData, form]);

  const quantity = Form.useWatch("quantity", form);
  const unitPrice = Form.useWatch("unit_price", form);
  const total = Number(quantity || 0) * Number(unitPrice || 0);

  const vendorOptions = vendorData?.vendors?.map((v: VendorTypes) => ({
    label: v.name,
    value: v.vendorId,
  }));

  const onFinish: FormProps<FormTypes>["onFinish"] = async (values) => {
    try {
      await createPurchase({
        variables: {
          quantity: values.quantity,
          unit_price: values.unit_price,
          purchase_date: values.purchase_date?.toISOString(),
          total_cost: Number(values.unit_price) * values.quantity,
          itemId: selectedItemId,
          vendorId: values.vendor,
        },
      });
      form.resetFields();
      message.success("Purchase history created");
      setRestockModal(false);
    } catch (err) {
      console.error(err);
      message.error(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <StyledForm
      form={form}
      layout="vertical"
      requiredMark={false}
      onFinish={onFinish}
      initialValues={{ quantity: 1, unit_price: 0 }}
    >
      <Section>
        <div>
          <SectionTitle>Purchase details</SectionTitle>
          <SectionHint>How many units were bought and at what price</SectionHint>
        </div>
        <Grid>
          <Form.Item<FormTypes>
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              placeholder="Enter quantity"
            />
          </Form.Item>
          <Form.Item<FormTypes>
            name="unit_price"
            label="Unit price"
            rules={[{ required: true, message: "Please enter unit price" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              step={0.01}
              prefix="$"
              placeholder="Enter unit price"
            />
          </Form.Item>
          <TotalBox>
            <span>Total cost</span>
            <strong>
              $
              {total.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </strong>
          </TotalBox>
        </Grid>
      </Section>

      <Section>
        <div>
          <SectionTitle>Date &amp; vendor</SectionTitle>
          <SectionHint>When and where the stock was purchased</SectionHint>
        </div>
        <Grid>
          <Form.Item<FormTypes>
            name="purchase_date"
            label="Purchase date"
            rules={[{ required: true, message: "Please select date and time" }]}
          >
            <DatePicker
              showTime
              style={{ width: "100%" }}
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
          <Form.Item<FormTypes>
            name="vendor"
            label="Vendor"
            rules={[{ required: true, message: "Please select a vendor" }]}
          >
            <Select
              style={{ width: "100%" }}
              loading={vendorsLoading}
              options={vendorOptions}
              placeholder="Select vendor"
            />
          </Form.Item>
          {error && (
            <FullRow>
              <span style={{ color: "#ff4d4f" }}>{error.message}</span>
            </FullRow>
          )}
        </Grid>
      </Section>

      <ActionBar>
        <Button onClick={() => setRestockModal(false)}>Cancel</Button>
        <SubmitButton type="primary" htmlType="submit" loading={loading}>
          {loading ? "Saving..." : "Create purchase"}
        </SubmitButton>
      </ActionBar>
    </StyledForm>
  );
};

export default CreatePurchaseHistory;
