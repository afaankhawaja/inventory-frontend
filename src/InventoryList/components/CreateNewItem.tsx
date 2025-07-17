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
  DatePicker,
  TreeSelect,
} from "antd";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_NEW_ITEM } from "../graphql/mutations";
import { FETCH_ALL_CATEGORIES, FETCH_ALL_LOCATIONS } from "../graphql/queries";
import type { Dayjs } from "dayjs";
import { useMemo } from "react";

type ItemType = {
  name?: string;
  expiry_date?: Dayjs | null;
  manufacturing_date?: Dayjs | null;
  price?: string;
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
// @ts-expect-error locations
function convertLocationsToTreeData(locations) {
  // @ts-expect-error locations
  return locations.map((location) => ({
    title: location.location_name || "Unnamed Location",
    value: location.locationId,
    children:
      location.subLocations && location.subLocations.length > 0
        ? convertLocationsToTreeData(location.subLocations)
        : undefined,
  }));
}

const CreateNewItem = ({ setOpen }: Props) => {
  const [form] = Form.useForm();
  const [createItem, { loading }] = useMutation(CREATE_NEW_ITEM);
  const { data: catData } = useQuery(FETCH_ALL_CATEGORIES);
  const { data: locData } = useQuery(FETCH_ALL_LOCATIONS);
  const conditionOptions = [
    {
      value: "NEW",
      label: "NEW",
    },
    {
      value: "IN_USE",
      label: "IN_USE",
    },
    {
      value: "DAMAGED",
      label: "DAMAGED",
    },
  ];
  const categoryOptions = catData?.categories.map(
    (category: CategoryProps) => ({
      value: category?.categoryId,
      label: category?.name,
    }),
  );
  const treeData = useMemo(() => {
    if (!locData?.locations) return [];
    return convertLocationsToTreeData(locData.locations);
  }, [locData]);

  const onFinish: FormProps<ItemType>["onFinish"] = (values) => {
    createItem({
      variables: {
        name: values.name,
        manufacturing_date: values?.manufacturing_date?.toISOString(),
        price: values.price,
        expiry_date: values?.expiry_date?.toISOString() || undefined,
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

      <Row gutter={12}>
        <Col span={12}>
          <Form.Item<ItemType>
            label="Condition"
            name="condition"
            rules={[{ required: true, message: "Please input the condition!" }]}
          >
            <Select
              style={{ height: "44px" }}
              options={conditionOptions}
              placeholder="Select category"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item<ItemType>
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please input the price!" }]}
          >
            <InputNumber placeholder="Enter price" style={{ width: "50%" }} />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={12}>
        <Col span={12}>
          <Form.Item name="expiry_date" label="Expiry Date">
            <DatePicker
              style={{ height: "44px", width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item name="manufacturing_date" label="Manufacturing Date">
            <DatePicker
              style={{ height: "44px", width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={12}>
        <Col span={12}>
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
            <InputNumber
              style={{ width: "50%" }}
              placeholder="Enter reorder threshold"
            />
          </Form.Item>
        </Col>
        <Col span={12}>
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
            <InputNumber
              style={{ width: "50%" }}
              placeholder="Enter quantity"
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item<ItemType>
        label="Brand"
        name="brand"
        rules={[{ required: true, message: "Please input the brand!" }]}
      >
        <Input placeholder="Enter brand" />
      </Form.Item>

      <Row gutter={12}>
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
            <TreeSelect
              treeData={treeData}
              placeholder="Select a location"
              loading={loading}
              treeDefaultExpandAll
              allowClear
              style={{ height: "44px" }}
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
