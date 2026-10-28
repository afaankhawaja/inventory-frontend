import { Table, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@apollo/client";
import { FETCH_ALL_PURCHASES } from "../graphql/queries";
import { useState } from "react";
import {
  SingleLineCell,
  useInlineRowExpand,
} from "../../components/ExpandedRowDetail";

interface PurchaseRecord {
  purchaseId: string;
  purchase_date: string;
  quantity: number;
  unit_price: string | number;
  total_cost: string | number;
  item: {
    name: string;
  };
  vendor: {
    name: string;
  };
  created_at: string;
  updated_at: string;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
};

const formatCurrency = (val?: string | number) => {
  if (val === undefined || val === null) return "—";
  return `$${Number(val).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const PurchaseHistoryTable: React.FC = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const { getRowProps, getRowClassName } = useInlineRowExpand<PurchaseRecord>(
    (r) => r.purchaseId,
  );

  const { loading, error, data } = useQuery(FETCH_ALL_PURCHASES, {
    variables: {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    },
    fetchPolicy: "network-only",
  });

  const purchases: PurchaseRecord[] = data?.purchaseHistories?.purchases || [];
  const columns: ColumnsType<PurchaseRecord> = [
    {
      title: "Purchase ID",
      dataIndex: "purchaseId",
      key: "purchaseId",
      width: 115,
      render: (val: string) => (
        <SingleLineCell style={{ fontFamily: "monospace", opacity: 0.8 }}>
          {val}
        </SingleLineCell>
      ),
    },
    {
      title: "Date",
      dataIndex: "purchase_date",
      key: "purchase_date",
      width: 110,
      render: (d: string) => <SingleLineCell>{formatDate(d)}</SingleLineCell>,
    },
    {
      title: "Item",
      dataIndex: ["item", "name"],
      key: "itemName",
      width: 260,
      render: (text: string) => (
        <SingleLineCell style={{ fontWeight: 500 }}>
          {text || "—"}
        </SingleLineCell>
      ),
    },
    {
      title: "Vendor",
      dataIndex: ["vendor", "name"],
      key: "vendor",
      width: 210,
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 75,
      align: "center",
      render: (val: number) => <SingleLineCell>{val ?? "—"}</SingleLineCell>,
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
      key: "unit_price",
      width: 125,
      align: "right",
      render: (val: string | number) => (
        <SingleLineCell>{formatCurrency(val)}</SingleLineCell>
      ),
    },
    {
      title: "Total Cost",
      dataIndex: "total_cost",
      key: "total_cost",
      width: 135,
      align: "right",
      render: (val: string | number) => (
        <SingleLineCell style={{ fontWeight: 600 }}>
          {formatCurrency(val)}
        </SingleLineCell>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      width: 110,
      render: (d: string) => <SingleLineCell>{formatDate(d)}</SingleLineCell>,
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      width: 110,
      render: (d: string) => <SingleLineCell>{formatDate(d)}</SingleLineCell>,
    },
  ];

  return (
    <>
      {loading && <>Loading purchase history…</>}
      {error && <>{error.message}</>}
      {!loading && !error && purchases.length === 0 && (
        <Alert message="No purchase history found!" type="info" showIcon />
      )}
      {!loading && !error && purchases.length > 0 && (
        <Table<PurchaseRecord>
          rowKey="purchaseId"
          tableLayout="fixed"
          loading={loading}
          dataSource={purchases}
          columns={columns}
          onRow={getRowProps}
          rowClassName={getRowClassName}
          sticky
          scroll={{ x: "max-content", y: "calc(100vh - 310px)" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.purchaseHistories?.total,
            onChange: (page, pageSize) =>
              setPagination({ current: page, pageSize }),
          }}
        />
      )}
    </>
  );
};

export default PurchaseHistoryTable;
