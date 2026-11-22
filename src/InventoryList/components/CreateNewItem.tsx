import {
  Button,
  Form,
  Input,
  InputNumber,
  type FormProps,
  Switch,
  Select,
  DatePicker,
  TreeSelect,
  message,
} from "antd";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_NEW_ITEM } from "../graphql/mutations";
import {
  FETCH_ALL_CATEGORIES,
  FETCH_ALL_ITEMS,
  FETCH_ALL_LOCATIONS,
} from "../graphql/queries";
import type { Dayjs } from "dayjs";
import { useMemo } from "react";
import {
  formStyles,
  Section,
  SectionTitle,
  SectionHint,
  Grid,
  FullRow,
  SwitchRow,
  SwitchText,
  ActionBar,
  SubmitButton,
} from "../../components/FormLayout";

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

const StyledForm = styled(Form<ItemType>)` ${formStyles}`;

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
  const [createItem, { loading }] = useMutation(CREATE_NEW_ITEM, {
    refetchQueries: [
      { query: FETCH_ALL_ITEMS, variables: { skip: 0, take: 500 } },
    ],
    awaitRefetchQueries: true,
  });
  const { data: catData } = useQuery(FETCH_ALL_CATEGORIES);
  const { data: locData } = useQuery(FETCH_ALL_LOCATIONS);
  const conditionOptions = [
    { value: "NEW", label: "NEW" },
    { value: "IN_USE", label: "IN_USE" },
    { value: "DAMAGED", label: "DAMAGED" },
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
    })
      .then(() => {
        form.resetFields();
        message.success("Created item successfully");
        setOpen(false);
      })
      .catch((error) => {
        message.error(error?.message || "Failed to create item");
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
      requiredMark={false}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <Section>
        <div>
          <SectionTitle>Basic information</SectionTitle>
          <SectionHint>What the item is and how to identify it</SectionHint>
        </div>
        <Grid>
          <FullRow>
            <Form.Item<ItemType>
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Please input the item name!" },
              ]}
            >
              <Input placeholder="Enter item name" />
            </Form.Item>
          </FullRow>
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
              style={{ width: "100%" }}
              options={categoryOptions}
              placeholder="Select category"
            />
          </Form.Item>
          <Form.Item<ItemType>
            label="Condition"
            name="condition"
            rules={[{ required: true, message: "Please input the condition!" }]}
          >
            <Select
              style={{ width: "100%" }}
              options={conditionOptions}
              placeholder="Select condition"
            />
          </Form.Item>
        </Grid>
      </Section>

      <Section>
        <div>
          <SectionTitle>Pricing &amp; stock</SectionTitle>
          <SectionHint>Value and quantity on hand</SectionHint>
        </div>
        <Grid>
          <Form.Item<ItemType>
            label="Price"
            name="price"
            rules={[{ required: true, message: "Please input the price!" }]}
          >
            <InputNumber
              placeholder="Enter price"
              prefix="$"
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item<ItemType>
            label="Quantity in stock"
            name="quantity_in_stock"
            rules={[
              {
                required: true,
                message: "Please input the quantity in stock!",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter quantity"
            />
          </Form.Item>
          <Form.Item<ItemType>
            label="Reorder threshold"
            name="reorder_threshold"
            rules={[
              {
                required: true,
                message: "Please input the reorder threshold!",
              },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter reorder threshold"
            />
          </Form.Item>
          <SwitchRow>
            <SwitchText>
              High value item
              <small>Flag this item as a high value asset</small>
            </SwitchText>
            <Form.Item<ItemType> name="is_high_value" valuePropName="checked">
              <Switch />
            </Form.Item>
          </SwitchRow>
        </Grid>
      </Section>

      <Section>
        <div>
          <SectionTitle>Dates &amp; location</SectionTitle>
          <SectionHint>When it was made and where it is stored</SectionHint>
        </div>
        <Grid>
          <Form.Item<ItemType>
            name="manufacturing_date"
            label="Manufacturing date"
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
          <Form.Item<ItemType> name="expiry_date" label="Expiry date">
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
          <FullRow>
            <Form.Item<ItemType>
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
                treeDefaultExpandAll
                allowClear
                style={{ width: "100%" }}
              />
            </Form.Item>
          </FullRow>
        </Grid>
      </Section>

      <ActionBar>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <SubmitButton type="primary" htmlType="submit" loading={loading}>
          {!loading ? "Create item" : "Creating..."}
        </SubmitButton>
      </ActionBar>
    </StyledForm>
  );
};

export default CreateNewItem;
