import { useState } from "react";
import { Table, Tag, Space } from "antd";
import type { ColumnsType } from "antd/es/table";
import { currentUserDataAtom } from "../../store/atoms";
import { useAtom } from "jotai";
import styled from "styled-components";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { LocationCell } from "./LocationCell";
import { SingleLineCell } from "../../components/ExpandedRowDetail";
import DetailDrawer, { TitleLink } from "../../components/DetailDrawer";

const EditButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: darkgreen;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    color: #32cd32;
  }
`;
const DeleteButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: red;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    color: #8b0000;
  }
`;

const RestockButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: rgb(163, 47, 132);
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    color: rgb(216, 121, 156);
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
  quantity_in_stock?: number;
  reorder_threshold?: number;
  is_high_value?: boolean;
  barcode?: string;
  expiry_date: string;
  manufacturing_date?: string;
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
  onRestockItem: (itemId: string) => void;
  pagination: PaginationType;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
};

const formatCurrency = (val?: number | string) => {
  if (val === undefined || val === null) return "—";
  return `$${Number(val).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const conditionColor = (c?: string) => {
  if (c === "NEW") return "green";
  if (c === "DAMAGED") return "red";
  if (c === "IN_USE") return "blue";
  return "default";
};

const ItemsTable = ({
  dataSource,
  onEditItem,
  onDeleteItem,
  onRestockItem,
  pagination,
}: ItemsTableProps) => {
  const [userData] = useAtom(currentUserDataAtom);
  const [detail, setDetail] = useState<Item | null>(null);

  const columns: ColumnsType<Item> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Item) => (
        <TitleLink onClick={() => setDetail(record)} title="View details">
          {text || "-"}
        </TitleLink>
      ),
    },
    {
      title: "Brand",
      dataIndex: "brand",
      key: "brand",
      width: 130,
      render: (text: string) => <SingleLineCell>{text || "-"}</SingleLineCell>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      render: (val: Category) => (
        <SingleLineCell>{val?.name || "—"}</SingleLineCell>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 130,
      align: "right",
      render: (val: number) => (
        <SingleLineCell style={{ fontWeight: 600 }}>
          {formatCurrency(val)}
        </SingleLineCell>
      ),
    },
    {
      title: "Stock",
      dataIndex: "quantity_in_stock",
      key: "quantity_in_stock",
      width: 80,
      align: "center",
      render: (val: number) => <SingleLineCell>{val ?? "—"}</SingleLineCell>,
    },
    {
      title: "Condition",
      dataIndex: "condition",
      key: "condition",
      width: 110,
      render: (val: string) => (
        <Tag color={conditionColor(val)} style={{ margin: 0 }}>
          {val || "—"}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      fixed: "right",
      width: userData?.role === "super-admin" ? 210 : 90,
      render: (record: Item) =>
        userData?.role === "super-admin" ? (
          <Space size="middle" onClick={(e) => e.stopPropagation()}>
            <RestockButton onClick={() => onRestockItem(record.itemId)}>
              <span>Restock</span> <PlusCircleOutlined />
            </RestockButton>
            <EditButton onClick={() => onEditItem(record.itemId)}>
              <span>Edit</span> <EditOutlined />
            </EditButton>
            <DeleteButton onClick={() => onDeleteItem(record.itemId)}>
              <span>Delete</span> <DeleteOutlined />
            </DeleteButton>
          </Space>
        ) : userData?.role === "admin" ? (
          <Space size="middle" onClick={(e) => e.stopPropagation()}>
            <EditButton onClick={() => onEditItem(record.itemId)}>
              <span>Edit</span> <EditOutlined />
            </EditButton>
          </Space>
        ) : null,
    },
  ];

  const getVisibleColumns = (role: string | null) => {
    if (role === "admin" || role === "super-admin") {
      return columns;
    }
    return columns.filter((column) => column.key !== "action");
  };

  const visibleColumns = getVisibleColumns(userData?.role);

  return (
    <>
    <Table<Item>
      rowKey="itemId"
      tableLayout="fixed"
      columns={visibleColumns}
      dataSource={dataSource}
      pagination={pagination}
      rowClassName={() => "row-static"}
      sticky
      scroll={{ x: 920, y: "calc(100vh - 340px)" }}
    />
    <DetailDrawer
      open={!!detail}
      title={detail?.name}
      onClose={() => setDetail(null)}
      fields={[
        { label: "Brand", value: detail?.brand || "-" },
        { label: "Category", value: detail?.category?.name || "-" },
        { label: "Price", value: formatCurrency(detail?.price) },
        { label: "Stock", value: detail?.quantity_in_stock ?? "-" },
        { label: "Reorder Threshold", value: detail?.reorder_threshold ?? "-" },
        { label: "Condition", value: detail?.condition ? <Tag color={conditionColor(detail.condition)} style={{ margin: 0 }}>{detail.condition}</Tag> : "-" },
        { label: "High Value", value: detail?.is_high_value ? "Yes" : "No" },
        { label: "Barcode", value: detail?.barcode || "-" },
        { label: "Location", value: detail?.location?.locationId ? <LocationCell locationId={detail.location.locationId} wrap /> : "-" },
        { label: "Manufactured", value: formatDate(detail?.manufacturing_date) },
        { label: "Expiry", value: formatDate(detail?.expiry_date) },
      ]}
    />
    </>
  );
};

export default ItemsTable;
