import { Table } from "antd";
import { currentUserDataAtom } from "../../store/atoms";
import { useAtom } from "jotai";
import { Space } from "antd";
import styled from "styled-components";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { LocationCell } from "./LocationCell";

const EditButton = styled.div`
  display: flex;
  gap: 0px 10px;
  color: darkgreen;
  cursor: pointer;
  &:hover {
    color: #32cd32;
  }
`;
const DeleteButton = styled.div`
  display: flex;
  gap: 0px 10px;
  color: red;
  cursor: pointer;
  &:hover {
    color: #8b0000;
  }
`;

interface Location {
  location_name: string;
  locationId: string;
}

interface Category {
  name: string;
}

interface Item {
  itemId: string;
  name: string;
  brand: string;
  price: number;
  condition: string;
  expiry_date: string;
  location: Location;
  category: Category;
}
interface PaginationType {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}
interface ItemsTableProps {
  dataSource: Item[];
  onEditItem: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  pagination: PaginationType;
}

const ItemsTable = ({
  dataSource,
  onEditItem,
  onDeleteItem,
  pagination,
}: ItemsTableProps) => {
  const [userData] = useAtom(currentUserDataAtom);

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
      title: "Mfg Date",
      dataIndex: "manufacturing_date",
      key: "manufacturing_date",
    },
    {
      title: "Location",
      key: "location",
      render: (record: Item) => {
        if (!record) return;
        const leafId = record?.location?.locationId;
        return leafId ? <LocationCell locationId={leafId} /> : "—";
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
    {
      title: "Action",
      key: "action",
      render: (record: Item) =>
        userData?.role === "super-admin" ? (
          <Space size="middle">
            <EditButton onClick={() => onEditItem(record.itemId)}>
              <>Edit</> <EditOutlined />
            </EditButton>
            <DeleteButton onClick={() => onDeleteItem(record.itemId)}>
              <>Delete </>
              <DeleteOutlined />
            </DeleteButton>
          </Space>
        ) : userData?.role === "admin" ? (
          <Space size="middle">
            <EditButton onClick={() => onEditItem(record.itemId)}>
              <>Edit</> <EditOutlined />
            </EditButton>
          </Space>
        ) : (
          <></>
        ),
    },
  ];

  const getVisibleColumns = (role: string | null) => {
    if (role === "admin" || role === "super-admin") {
      return columns;
    } else {
      return columns.filter((column) => column.key !== "action");
    }
  };
  const visibleColumns = getVisibleColumns(userData?.role);

  return (
    <Table
      columns={visibleColumns}
      dataSource={dataSource}
      pagination={pagination}
      sticky={true}
    />
  );
};

export default ItemsTable;
