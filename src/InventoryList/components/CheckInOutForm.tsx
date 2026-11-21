import React from "react";
import { Button, Form, Input, InputNumber, message } from "antd";
import styled from "styled-components";
import { useMutation } from "@apollo/client";
import { CHECK_IN_ITEM, CHECK_OUT_ITEM } from "../graphql/mutations";
import { FETCH_ALL_ITEMS, GET_TRANSACTIONS } from "../graphql/queries";
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

export type CheckMode = "out" | "in";

interface FormValues {
  quantity: number;
  purpose?: string;
}

const StyledForm = styled(Form<FormValues>)`
  ${formStyles}
`;

const Summary = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 12px 15px;
  border-radius: 10px;
  background: rgba(128, 128, 128, 0.08);
  text-align: center;

  small {
    display: block;
    font-size: 12px;
    opacity: 0.6;
  }
  strong {
    font-size: 18px;
    font-weight: 600;
  }
`;

interface Props {
  mode: CheckMode;
  itemId: string;
  itemName: string;
  userId?: string;
  /** Units on hand in the vault. */
  stock: number;
  /** Units currently checked out and not yet returned. */
  outstanding: number;
  onClose: () => void;
}

const CheckInOutForm: React.FC<Props> = ({
  mode,
  itemId,
  itemName,
  userId,
  stock,
  outstanding,
  onClose,
}) => {
  const [form] = Form.useForm<FormValues>();
  const isOut = mode === "out";
  const max = isOut ? stock : outstanding;

  const [mutate, { loading }] = useMutation(
    isOut ? CHECK_OUT_ITEM : CHECK_IN_ITEM,
    {
      refetchQueries: [{ query: GET_TRANSACTIONS }, FETCH_ALL_ITEMS],
      awaitRefetchQueries: true,
    },
  );

  const quantity = Form.useWatch("quantity", form) ?? 1;

  const onFinish = async (values: FormValues) => {
    try {
      await mutate({
        variables: {
          userId,
          itemId,
          quantity: values.quantity,
          purpose: values.purpose,
        },
      });
      message.success(
        isOut
          ? `Checked out ${values.quantity} × ${itemName}`
          : `Checked in ${values.quantity} × ${itemName}`,
      );
      onClose();
    } catch (err) {
      message.error(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <StyledForm
      form={form}
      layout="vertical"
      requiredMark={false}
      initialValues={{ quantity: 1 }}
      onFinish={onFinish}
    >
      <Section>
        <div>
          <SectionTitle>{itemName}</SectionTitle>
          <SectionHint>
            {isOut
              ? "Take units out of the vault. Stock on hand goes down."
              : "Return units to the vault. Stock on hand goes back up."}
          </SectionHint>
        </div>
        <Summary>
          <div>
            <small>In stock</small>
            <strong>{stock}</strong>
          </div>
          <div>
            <small>Currently checked out</small>
            <strong>{outstanding}</strong>
          </div>
          <div>
            <small>Stock after</small>
            <strong>{isOut ? stock - quantity : stock + quantity}</strong>
          </div>
        </Summary>
        <Grid>
          <Form.Item<FormValues>
            name="quantity"
            label={isOut ? "Quantity to check out" : "Quantity to check in"}
            extra={`Maximum ${max}`}
            rules={[{ required: true, message: "Please enter a quantity" }]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1}
              max={max}
              precision={0}
            />
          </Form.Item>
          <FullRow>
            <Form.Item<FormValues>
              name="purpose"
              label={isOut ? "Purpose (optional)" : "Note (optional)"}
            >
              <Input.TextArea
                rows={2}
                maxLength={200}
                placeholder={
                  isOut
                    ? "e.g. Client viewing, repair, display"
                    : "e.g. Returned in good condition"
                }
              />
            </Form.Item>
          </FullRow>
        </Grid>
      </Section>

      <ActionBar>
        <Button onClick={onClose}>Cancel</Button>
        <SubmitButton
          type="primary"
          htmlType="submit"
          loading={loading}
          disabled={max < 1}
        >
          {isOut ? "Check out" : "Check in"}
        </SubmitButton>
      </ActionBar>
    </StyledForm>
  );
};

export default CheckInOutForm;
