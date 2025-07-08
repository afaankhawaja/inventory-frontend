import {
  Button,
  Form,
  Input,
  InputNumber,
  Checkbox,
  type FormProps,
} from "antd";
import styled from "styled-components";
import { useMutation } from "@apollo/client";
import { CREATE_NEW_ITEM } from "../graphql/mutations";

type ItemType = {
  name?: string;
  //   expiry_date?: string;
  //   price?: string;
  condition?: string;
  quantity_in_stock?: number;
  reorder_threshold?: number;
  is_high_value?: boolean;
  brand?: string;
  barcode?: string;
  category_name?: string;
  location_name?: string;
};

const StyledForm = styled(Form<ItemType>)`
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
  setOpen: (arg: boolean) => void;
}

const CreateNewItem = ({ setOpen }: Props) => {
  const [form] = Form.useForm();
  const [createItem, { loading }] = useMutation(CREATE_NEW_ITEM);

    const onFinish: FormProps<ItemType>["onFinish"] = (values) => {
    createItem({
      variables: {
        name: values.name,
        // expiry_date: values.expiry_date,
        // price: values.price,
        condition: values.condition,
        quantity_in_stock: values.quantity_in_stock,
        reorder_threshold: values.reorder_threshold,
        is_high_value: values.is_high_value,
        brand: values.brand,
        barcode: values.barcode,
        category_name: values.category_name,
        location_name: values.location_name,
      },
    }).then(() => {
      form.resetFields();
      alert("created item successfully");
      setOpen(false);
    });
  };

  const onFinishFailed: FormProps<ItemType>["onFinishFailed"] = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <StyledForm
      form={form}
      name="createItem"
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Form.Item<ItemType>
        label="Name"
        name="name"
        rules={[{ required: true, message: "Please input the item name!" }]}
      >
        <Input placeholder="Enter item name" />
      </Form.Item>

      {/* <Form.Item<ItemType> label="Expiry Date" name="expiry_date">
        <Input placeholder="YYYY-MM-DD" />
      </Form.Item>

      <Form.Item<ItemType>
        label="Price"
        name="price"
        rules={[{ required: true, message: "Please input the price!" }]}
      >
        <InputNumber placeholder="Enter price" />
      </Form.Item> */}

      <Form.Item<ItemType>
        label="Condition"
        name="condition"
        rules={[{ required: true, message: "Please input the condition!" }]}
      >
        <Input placeholder="Enter condition" />
      </Form.Item>

      <Form.Item<ItemType>
        label="Quantity in Stock"
        name="quantity_in_stock"
        rules={[
          { required: true, message: "Please input the quantity in stock!" },
        ]}
      >
        <InputNumber placeholder="Enter quantity" />
      </Form.Item>

      <Form.Item<ItemType>
        label="Reorder Threshold"
        name="reorder_threshold"
        rules={[
          { required: true, message: "Please input the reorder threshold!" },
        ]}
      >
        <InputNumber placeholder="Enter reorder threshold" />
      </Form.Item>

      <Form.Item<ItemType>
        label="Is High Value"
        name="is_high_value"
        valuePropName="checked"
      >
        <Checkbox>Is High Value</Checkbox>
      </Form.Item>

      <Form.Item<ItemType>
        label="Brand"
        name="brand"
        rules={[{ required: true, message: "Please input the brand!" }]}
      >
        <Input placeholder="Enter brand" />
      </Form.Item>

      <Form.Item<ItemType>
        label="Barcode"
        name="barcode"
        rules={[{ required: true, message: "Please input the barcode!" }]}
      >
        <Input placeholder="Enter barcode" />
      </Form.Item>

      <Form.Item<ItemType>
        label="Category Name"
        name="category_name"
        rules={[{ required: true, message: "Please input the category name!" }]}
      >
        <Input placeholder="Enter category name" />
      </Form.Item>

      <Form.Item<ItemType>
        label="Location Name"
        name="location_name"
        rules={[{ required: true, message: "Please input the location name!" }]}
      >
        <Input placeholder="Enter location name" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {!loading ? "Create Item" : "creating..."}
        </Button>
      </Form.Item>
    </StyledForm>
  );
};

export default CreateNewItem;
