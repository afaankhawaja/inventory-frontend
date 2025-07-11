import { useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Row,
  Col,
  Select,
  Button,
  type FormProps,
} from "antd";
import { useQuery, useMutation } from "@apollo/client";
import styled from "styled-components";
import {
  FETCH_ITEM_BY_ID,
  FETCH_ALL_CATEGORIES,
  FETCH_ALL_LOCATIONS,
} from "../graphql/queries";
import { UPDATE_ITEM } from "../graphql/mutations";

type FieldType = {
  name?: string;
  condition?: string;
  quantity_in_stock?: number;
  reorder_threshold?: number;
  is_high_value?: boolean;
  brand?: string;
  barcode?: string;
  category?: string;
  location?: string;
};

interface CategoryProps {
  categoryId?: string;
  name?: string;
}

interface LocationProps {
  locationId?: string;
  location_name?: string;
}

const StyledForm = styled(Form<FieldType>)`
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

interface PropsType {
  selectedItemId: string;
  setUpdateModal: (state: boolean) => void;
}

const UpdateItem = ({ selectedItemId, setUpdateModal }: PropsType) => {
  const [form] = Form.useForm();
  const { data, loading, error } = useQuery(FETCH_ITEM_BY_ID, {
    variables: { itemID: selectedItemId },
  });
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

  const [updateItem, { loading: updating }] = useMutation(UPDATE_ITEM);
  const item = data?.item;

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        name: item.name,
        condition: item.condition,
        quantity_in_stock: item.quantity_in_stock,
        reorder_threshold: item.reorder_threshold,
        is_high_value: item.is_high_value,
        brand: item.brand,
        barcode: item.barcode,
        category: item.category?.categoryId || "",
        location: item.location?.locationId || "",
      });
    }
  }, [item, form]);

  if (loading) return <p>Loading item data...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!item) return <p>No item found</p>;

  const onFinish: FormProps<FieldType>["onFinish"] = (values: FieldType) => {
    updateItem({
      variables: {
        itemID: selectedItemId,
        name: values.name,
        condition: values.condition,
        quantity_in_stock: values.quantity_in_stock,
        reorder_threshold: values.reorder_threshold,
        is_high_value: values.is_high_value,
        brand: values.brand,
        barcode: values.barcode,
        categoryId: values.category,
        locationId: values.location,
      },
    })
      .then(() => {
        form.resetFields();
        alert("Updated item successfully");
        setUpdateModal(false);
      })
      .catch((err) => {
        alert(err.message);
        console.log("err.message", err.message);
      });
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };
  return (
    <div>
      <StyledForm
        form={form}
        name="updateItem"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input placeholder="Item name" />
        </Form.Item>

        <Form.Item name="condition" label="Condition">
          <Input placeholder="Condition" />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="quantity_in_stock" label="Quantity in Stock">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="reorder_threshold" label="Reorder Threshold">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="is_high_value" label="High Value">
          <Switch />
        </Form.Item>

        <Form.Item name="brand" label="Brand">
          <Input placeholder="Brand" />
        </Form.Item>

        <Form.Item name="barcode" label="Barcode">
          <Input placeholder="Barcode" />
        </Form.Item>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="category" label="Category">
              <Select
                style={{ height: "44px" }}
                options={categoryOptions}
                placeholder="Select category"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="location" label="Location">
              <Select
                style={{ height: "44px" }}
                options={locationOptions}
                placeholder="Select location"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={updating}>
            {updating ? "Updating…" : "Update Item"}
          </Button>
        </Form.Item>
      </StyledForm>
    </div>
  );
};

export default UpdateItem;
