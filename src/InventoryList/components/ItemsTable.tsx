import type React from "react";
import { useState } from "react";
import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { currentUserDataAtom } from "../../store/atoms";
import { useAtom } from "jotai";
import {
  DeleteOutlined,
  EditOutlined,
  PlusCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { LocationCell } from "./LocationCell";
import { SingleLineCell } from "../../components/ExpandedRowDetail";
import DetailDrawer, { TitleLink } from "../../components/DetailDrawer";
import RowActions, { type RowAction } from "../../components/RowActions";
import BarcodeLabelCard from "../../components/BarcodeLabelCard";

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
  onCheck: (itemId: string, mode: "in" | "out") => void;
  /** Units currently checked out (not yet returned), by itemId. */
  outstandingByItem: Map<string, number>;
  pagination: PaginationType;
  isFiltered?: boolean;
  onResetFilters?: () => void;
  selectedRowKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
  inspectedItem?: Item | null;
  onInspectItem?: (item: Item | null) => void;
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
  onCheck,
  outstandingByItem,
  pagination,
  isFiltered,
  onResetFilters,
  selectedRowKeys,
  onSelectionChange,
  inspectedItem,
  onInspectItem,
}: ItemsTableProps) => {
  const [userData] = useAtom(currentUserDataAtom);
  const [internalDetail, setInternalDetail] = useState<Item | null>(null);
  const detail = inspectedItem !== undefined ? inspectedItem : internalDetail;
  const setDetail = onInspectItem ?? setInternalDetail;

  const columns: ColumnsType<Item> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => (a.name || "").localeCompare(b.name || ""),
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
      sorter: (a, b) => (a.brand || "").localeCompare(b.brand || ""),
      render: (text: string) => <SingleLineCell>{text || "-"}</SingleLineCell>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 150,
      sorter: (a, b) =>
        (a.category?.name || "").localeCompare(b.category?.name || ""),
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
      sorter: (a, b) => Number(a.price || 0) - Number(b.price || 0),
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
      width: 100,
      align: "center",
      sorter: (a, b) =>
        Number(a.quantity_in_stock || 0) - Number(b.quantity_in_stock || 0),
      render: (val: number, record: Item) => {
        const threshold = record.reorder_threshold ?? 0;
        const isOut = (val ?? 0) === 0;
        const isLow = !isOut && (val ?? 0) <= threshold;
        return (
          <SingleLineCell>
            <span>{val ?? "—"}</span>
            {isOut && (
              <Tag
                color="error"
                style={{
                  margin: "0 0 0 6px",
                  fontSize: 10,
                  lineHeight: "16px",
                  padding: "0 4px",
                  borderRadius: 4,
                }}
              >
                Out
              </Tag>
            )}
            {isLow && (
              <Tag
                color="warning"
                style={{
                  margin: "0 0 0 6px",
                  fontSize: 10,
                  lineHeight: "16px",
                  padding: "0 4px",
                  borderRadius: 4,
                }}
              >
                Low
              </Tag>
            )}
          </SingleLineCell>
        );
      },
    },
    {
      title: "Condition",
      dataIndex: "condition",
      key: "condition",
      width: 110,
      sorter: (a, b) => (a.condition || "").localeCompare(b.condition || ""),
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
      width: 90,
      align: "center",
      render: (record: Item) => {
        const role = userData?.role;
        const actions: RowAction[] = [];
        if (role === "super-admin") {
          actions.push({
            key: "restock",
            label: "Restock",
            icon: <PlusCircleOutlined />,
            onClick: () => onRestockItem(record.itemId),
          });
        }
        const outstanding = outstandingByItem.get(record.itemId) ?? 0;
        if ((record.quantity_in_stock ?? 0) > 0) {
          actions.push({
            key: "checkout",
            label: "Check out",
            icon: <LogoutOutlined />,
            onClick: () => onCheck(record.itemId, "out"),
          });
        }
        if (outstanding > 0) {
          actions.push({
            key: "checkin",
            label: `Check in (${outstanding} out)`,
            icon: <LoginOutlined />,
            onClick: () => onCheck(record.itemId, "in"),
          });
        }
        actions.push({
          key: "edit",
          label: "Edit",
          icon: <EditOutlined />,
          onClick: () => onEditItem(record.itemId),
        });
        if (role === "super-admin") {
          actions.push({
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => onDeleteItem(record.itemId),
          });
        }
        return <RowActions actions={actions} />;
      },
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
        rowSelection={
          onSelectionChange
            ? {
                selectedRowKeys,
                onChange: (keys) => onSelectionChange(keys),
                preserveSelectedRowKeys: true,
              }
            : undefined
        }
        pagination={{
          ...pagination,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        }}
        rowClassName={() => "row-static"}
        sticky
        scroll={{ x: 920, y: "calc(100vh - 350px)" }}
        locale={{
          emptyText: (
            <div style={{ padding: "32px 16px", textAlign: "center" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "inherit",
                }}
              >
                {isFiltered
                  ? "No items match your filters"
                  : "No items in vault"}
              </p>
              <p
                style={{
                  margin: "6px 0 16px",
                  fontSize: 13,
                  opacity: 0.65,
                }}
              >
                {isFiltered
                  ? "Try adjusting your search terms or clearing your filters"
                  : "Items added to the system will appear here"}
              </p>
              {isFiltered && onResetFilters && (
                <Button size="small" onClick={onResetFilters}>
                  Clear all filters
                </Button>
              )}
            </div>
          ),
        }}
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
          {
            label: "Checked out",
            value: detail
              ? (outstandingByItem.get(detail.itemId) ?? 0)
              : "-",
          },
          {
            label: "Reorder Threshold",
            value: detail?.reorder_threshold ?? "-",
          },
          {
            label: "Condition",
            value: detail?.condition ? (
              <Tag
                color={conditionColor(detail.condition)}
                style={{ margin: 0 }}
              >
                {detail.condition}
              </Tag>
            ) : (
              "-"
            ),
          },
          { label: "High Value", value: detail?.is_high_value ? "Yes" : "No" },
          { label: "Barcode", value: detail?.barcode || "-" },
          {
            label: "Location",
            value: detail?.location?.locationId ? (
              <LocationCell locationId={detail.location.locationId} wrap />
            ) : (
              "-"
            ),
          },
          {
            label: "Manufactured",
            value: formatDate(detail?.manufacturing_date),
          },
          { label: "Expiry", value: formatDate(detail?.expiry_date) },
        ]}
        extra={
          <BarcodeLabelCard
            itemId={detail?.itemId}
            barcode={detail?.barcode}
            itemName={detail?.name}
            brand={detail?.brand}
            category={detail?.category?.name}
            price={formatCurrency(detail?.price)}
          />
        }
      />
    </>
  );
};

export default ItemsTable;
