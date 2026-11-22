import { useEffect, useMemo } from "react";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Button,
  DatePicker,
  type FormProps,
  TreeSelect,
  message,
} from "antd";
import { useQuery, useMutation } from "@apollo/client";
import styled from "styled-components";
import dayjs, { type Dayjs } from "dayjs";
import {
  FETCH_ITEM_BY_ID,
  FETCH_ALL_CATEGORIES,
  FETCH_ALL_ITEMS,
  FETCH_ALL_LOCATIONS,
} from "../graphql/queries";
import { UPDATE_ITEM } from "../graphql/mutations";
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

type FieldType = {
  name?: string;
  price?: string;
  condition?: string;
  quantity_in_stock?: number;
  reorder_threshold?: number;
  is_high_value?: boolean;
  brand?: string;
  barcode?: string;
  category?: string;
  location?: string;
  manufacturing_date?: Dayjs | null;
  expiry_date?: Dayjs | null;
};

interface CategoryProps {
  categoryId?: string;
  name?: string;
}

interface LocationNode {
  locationId: string;
  location_name?: string;
  subLocations?: LocationNode[];
}

interface TreeNode {
  title: string;
  value: string;
  children?: TreeNode[];
}

const StyledForm = styled(Form<FieldType>)`
  ${formStyles}
`;

function convertLocationsToTreeData(locations: LocationNode[]): TreeNode[] {
  return locations.map((location) => ({
    title: location.location_name || "Unnamed Location",
    value: location.locationId,
    children:
      location.subLocations && location.subLocations.length > 0
        ? convertLocationsToTreeData(location.subLocations)
        : undefined,
  }));
}

const conditionOptions = [
  { value: "NEW", label: "NEW" },
  { value: "IN_USE", label: "IN_USE" },
  { value: "DAMAGED", label: "DAMAGED" },
];

interface PropsType {
  selectedItemId: string;
  setUpdateModal: (state: boolean) => void;
}

const UpdateItem = ({ selectedItemId, setUpdateModal }: PropsType) => {
  const [form] = Form.useForm<FieldType>();
  const { data, loading, error } = useQuery(FETCH_ITEM_BY_ID, {
    variables: { itemID: selectedItemId },
    fetchPolicy: "cache-and-network",
  });
  const { data: catData } = useQuery(FETCH_ALL_CATEGORIES);
  const { data: locData } = useQuery(FETCH_ALL_LOCATIONS);
  const [updateItem, { loading: updating }] = useMutation(UPDATE_ITEM, {
    refetchQueries: [
      { query: FETCH_ALL_ITEMS, variables: { skip: 0, take: 500 } },
    ],
    awaitRefetchQueries: true,
  });

  const treeData = useMemo(() => {
    if (!locData?.locations) return [];
    return convertLocationsToTreeData(locData.locations);
  }, [locData]);

  const categoryOptions = catData?.categories.map(
    (category: CategoryProps) => ({
      value: category?.categoryId,
      label: category?.name,
    }),
  );

  const item = data?.item;

  useEffect(() => {
    if (item) {
      form.setFieldsValue({
        name: item.name,
        price: item.price,
        condition: item.condition,
        quantity_in_stock: item.quantity_in_stock,
        reorder_threshold: item.reorder_threshold,
        is_high_value: item.is_high_value,
        brand: item.brand,
        barcode: item.barcode,
        category: item.category?.categoryId || undefined,
        location: item.location?.locationId || undefined,
        manufacturing_date: item.manufacturing_date
          ? dayjs(item.manufacturing_date)
          : null,
        expiry_date: item.expiry_date ? dayjs(item.expiry_date) : null,
      });
    }
  }, [item, form]);

  if (loading && !item) return <p>Loading item data...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!item) return <p>No item found</p>;

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    updateItem({
      variables: {
        itemID: selectedItemId,
        name: values.name,
        price: values.price,
        condition: values.condition,
        quantity_in_stock: values.quantity_in_stock,
        reorder_threshold: values.reorder_threshold,
        is_high_value: values.is_high_value,
        brand: values.brand,
        barcode: values.barcode,
        categoryId: values.category,
        locationId: values.location,
        manufacturing_date: values.manufacturing_date
          ? values.manufacturing_date.toISOString()
          : null,
        expiry_date: values.expiry_date
          ? values.expiry_date.toISOString()
          : null,
      },
    })
      .then(() => {
        message.success("Updated item successfully");
        setUpdateModal(false);
      })
      .catch((err) => {
        message.error(err.message);
      });
  };

  return (
    <StyledForm
      form={form}
      name="updateItem"
      layout="vertical"
      requiredMark={false}
      onFinish={onFinish}
    >
      <Section>
        <div>
          <SectionTitle>Basic information</SectionTitle>
          <SectionHint>What the item is and how to identify it</SectionHint>
        </div>
        <Grid>
          <FullRow>
            <Form.Item<FieldType>
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Please input the item name!" },
              ]}
            >
              <Input placeholder="Enter item name" />
            </Form.Item>
          </FullRow>
          <Form.Item<FieldType>
            label="Brand"
            name="brand"
            rules={[{ required: true, message: "Please input the brand!" }]}
          >
            <Input placeholder="Enter brand" />
          </Form.Item>
          <Form.Item<FieldType>
            label="Barcode"
            name="barcode"
            rules={[{ required: true, message: "Please input the barcode!" }]}
          >
            <Input placeholder="Enter barcode" />
          </Form.Item>
          <Form.Item<FieldType>
            label="Category"
            name="category"
            rules={[
              { required: true, message: "Please select the category!" },
            ]}
          >
            <Select
              style={{ width: "100%" }}
              options={categoryOptions}
              placeholder="Select category"
            />
          </Form.Item>
          <Form.Item<FieldType>
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
          <Form.Item<FieldType>
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
          <Form.Item<FieldType>
            label="Quantity in stock"
            name="quantity_in_stock"
            rules={[
              { required: true, message: "Please input the quantity in stock!" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              placeholder="Enter quantity"
            />
          </Form.Item>
          <Form.Item<FieldType>
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
            <Form.Item<FieldType> name="is_high_value" valuePropName="checked">
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
          <Form.Item<FieldType>
            name="manufacturing_date"
            label="Manufacturing date"
          >
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
          <Form.Item<FieldType> name="expiry_date" label="Expiry date">
            <DatePicker
              style={{ width: "100%" }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
            />
          </Form.Item>
          <FullRow>
            <Form.Item<FieldType>
              name="location"
              label="Location"
              rules={[
                { required: true, message: "Please select the location!" },
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
        <Button onClick={() => setUpdateModal(false)}>Cancel</Button>
        <SubmitButton type="primary" htmlType="submit" loading={updating}>
          {updating ? "Saving…" : "Save changes"}
        </SubmitButton>
      </ActionBar>
    </StyledForm>
  );
};

export default UpdateItem;
