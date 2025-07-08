import { Table } from "antd";

interface Location {
  location_name: string;
}

interface Category {
  name: string;
}

interface Item {
  name: string;
  brand: string;
  price: number;
  condition: string;
  expiry_date: string;
  location: Location;
  category: Category;
}
interface ItemsTableProps {
  dataSource: Item[];
}

const columns = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Brand",
    dataIndex: "brand",
    key: "brand",
  },
  {
    title: "Price",
    dataIndex: "price",
    key: "price",
  },
  {
    title: "Condition",
    dataIndex: "condition",
    key: "condition",
  },
  {
    title: "Expiry Date",
    dataIndex: "expiry_date",
    key: "expiry_date",
  },
  {
    title: "Location",
    dataIndex: "location",
    key: "location",
    render: (val: Location) => {
      if (!val) return;
      return val.location_name;
    },
  },
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
    render: (val: Category) => {
      if (!val) return;
      return val.name;
    },
  },
];

const ItemsTable = ({ dataSource }: ItemsTableProps) => {
  return <Table columns={columns} dataSource={dataSource} />;
};

export default ItemsTable;
