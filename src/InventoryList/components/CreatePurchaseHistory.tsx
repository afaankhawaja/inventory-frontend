import React from "react";
import {
  Form,
  InputNumber,
  DatePicker,
  Select,
  Button,
  type FormProps,
  Row,
  Col,
} from "antd";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_PURCHASE_HISTORY } from "../graphql/mutations";
import { FETCH_ALL_VENDORS } from "../graphql/queries";
import type { Dayjs } from "dayjs";

const StyledForm = styled(Form<FormTypes>)`
  width: 100%;
  .ant-form-item-label > label {
    font-weight: 500;
  }
  .ant-btn-primary {
    width: 100%;
    border: none;
    box-shadow: 0 4px 15px #1890ff;
    transition: all 0.3s ease;
  }
`;

interface Props {
  selectedItemId: string;
  setRestockModal: (state: boolean) => void;
}
interface FormTypes {
  quantity: number;
  unit_price?: string;
  purchase_date?: Dayjs | null;
  total_cost?: string;
  vendor?: string;
}
interface VendorTypes {
  name: string;
  vendorId: string;
}

const CreatePurchaseHistory: React.FC<Props> = ({
  selectedItemId,
  setRestockModal,
}) => {
  const [form] = Form.useForm();
  const { data: vendorData, loading: vendorsLoading } =
    useQuery(FETCH_ALL_VENDORS);
  const [createPurchase, { loading, error }] = useMutation(
    CREATE_PURCHASE_HISTORY,
  );

  const vendorOptions = vendorData?.vendors?.map((v: VendorTypes) => ({
    label: v.name,
    value: v.vendorId,
  }));

  const onFinish: FormProps<FormTypes>["onFinish"] = async (values) => {
    const totalCost = Number(values.unit_price) * values.quantity;
    try {
      createPurchase({
        variables: {
          quantity: values.quantity,
          unit_price: values.unit_price,
          purchase_date: values.purchase_date,
          total_cost: totalCost,
          itemId: selectedItemId,
          vendorId: values.vendor,
        },
      });
      form.resetFields();
      alert(`Purchase history created`);
      setRestockModal(false);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  return (
    <StyledForm
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ quantity: 1, unit_price: 0, total_cost: 0 }}
    >
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: "Please enter quantity" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="unit_price"
            label="Unit Price"
            rules={[{ required: true, message: "Please enter unit price" }]}
          >
            <InputNumber style={{ width: "100%" }} min={0} step={0.01} />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="purchase_date"
        label="Purchase Date"
        rules={[{ required: true, message: "Please select date and time" }]}
      >
        <DatePicker showTime style={{ width: "100%", height: "44px" }} />
      </Form.Item>

      <Form.Item
        name="vendor"
        label="Vendor"
        rules={[{ required: true, message: "Please select a vendor" }]}
      >
        <Select
          style={{ height: "44px" }}
          loading={vendorsLoading}
          options={vendorOptions}
          placeholder="Select vendor"
        />
      </Form.Item>

      <Form.Item
        style={{
          justifyContent: "end",
          display: "flex",
        }}
      >
        <Button
          variant="outlined"
          color="cyan"
          htmlType="submit"
          loading={loading}
        >
          {loading ? "Saving..." : "Create Purchase"}
        </Button>
      </Form.Item>

      {error && <p style={{ color: "red" }}>{error.message}</p>}
    </StyledForm>
  );
};

export default CreatePurchaseHistory;
