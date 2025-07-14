import {
  Button,
  Form,
  Input,
  InputNumber,
  type FormProps,
  Row,
  Col,
  Switch,
  Select,
} from "antd";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_NEW_ITEM } from "../graphql/mutations";
import { FETCH_ALL_CATEGORIES, FETCH_ALL_LOCATIONS } from "../graphql/queries";

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
  category?: string;
  location?: string;
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
interface CategoryProps {
  categoryId?: string;
  name?: string;
}

interface LocationProps {
  locationId?: string;
  location_name?: string;
}

const CreateNewItem = ({ setOpen }: Props) => {
  const [form] = Form.useForm();
  const [createItem, { loading }] = useMutation(CREATE_NEW_ITEM);
  const { data: catData } = useQuery(FETCH_ALL_CATEGORIES);
  const { data: locData } = useQuery(FETCH_ALL_LOCATIONS);

  const categoryOptions = catData?.categories.map(
    (category: CategoryProps) => ({
      value: category?.categoryId,
      label: category?.name,
    }),
  );
  const locationOptions = locData?.locations.map((location: LocationProps) => ({
    value: location?.locationId,
    label: location?.location_name,
  }));

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
        categoryId: values.category,
        locationId: values.location,
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

      <Row gutter={10}>
        <Col span={8}>
          <Form.Item<ItemType>
            label="Brand"
            name="brand"
            rules={[{ required: true, message: "Please input the brand!" }]}
          >
            <Input placeholder="Enter brand" />
          </Form.Item>
        </Col>
        <Col span={16}>
          <Form.Item<ItemType>
            label="Quantity in Stock"
            name="quantity_in_stock"
            rules={[
              {
                required: true,
                message: "Please input the quantity in stock!",
              },
            ]}
          >
            <InputNumber placeholder="Enter quantity" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item<ItemType>
        label="Reorder Threshold"
        name="reorder_threshold"
        rules={[
          {
            required: true,
            message: "Please input the reorder threshold!",
          },
        ]}
      >
        <InputNumber placeholder="Enter reorder threshold" />
      </Form.Item>

      <Row gutter={38}>
        <Col span={12}>
          <Form.Item<ItemType>
            label="Barcode"
            name="barcode"
            rules={[{ required: true, message: "Please input the barcode!" }]}
          >
            <Input placeholder="Enter barcode" />
          </Form.Item>
        </Col>
        <Col span={12} style={{ alignContent: "center" }}>
          <Form.Item<ItemType>
            label="High Value item"
            name="is_high_value"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item
            name="category"
            label="Category"
            rules={[
              {
                required: true,
                message: "Please input the relevant category!",
              },
            ]}
          >
            <Select
              style={{ height: "44px" }}
              options={categoryOptions}
              placeholder="Select category"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="location"
            label="Location"
            rules={[
              {
                required: true,
                message: "Please input the relevant location!",
              },
            ]}
          >
            <Select
              style={{ height: "44px" }}
              options={locationOptions}
              placeholder="Select location"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          {!loading ? "Create Item" : "creating..."}
        </Button>
      </Form.Item>
    </StyledForm>
  );
};

export default CreateNewItem;
