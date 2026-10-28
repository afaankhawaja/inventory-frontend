import React, { useState } from "react";
import { Table, Alert } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@apollo/client";
import { GET_ALL_PURCHASE_HISTORY } from "../graphql/queries";
import {
  SingleLineCell,
  useInlineRowExpand,
} from "../../components/ExpandedRowDetail";

interface PurchaseRow {
  purchaseId: string;
  purchase_date: string;
  quantity: number;
  unit_price: number | string;
  total_cost: number | string;
  item?: {
    name?: string;
    brand?: string;
  };
  vendor?: {
    name?: string;
  };
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

const columns: ColumnsType<PurchaseRow> = [
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
    title: "Item",
    dataIndex: ["item", "name"],
    key: "item",
    width: 240,
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
    width: 200,
    render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
  },
  {
    title: "Date",
    dataIndex: "purchase_date",
    key: "purchase_date",
    width: 110,
    render: (date: string) => <SingleLineCell>{formatDate(date)}</SingleLineCell>,
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
    render: (price: number | string) => (
      <SingleLineCell>{formatCurrency(price)}</SingleLineCell>
    ),
  },
  {
    title: "Total Cost",
    dataIndex: "total_cost",
    key: "total_cost",
    width: 135,
    align: "right",
    render: (cost: number | string) => (
      <SingleLineCell style={{ fontWeight: 600 }}>
        {formatCurrency(cost)}
      </SingleLineCell>
    ),
  },
];

const PurchaseHistoryTable: React.FC = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  const { getRowProps, getRowClassName } = useInlineRowExpand<PurchaseRow>(
    (r) => r.purchaseId,
  );

  const { loading, error, data } = useQuery(GET_ALL_PURCHASE_HISTORY, {
    variables: {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    },
  });
  const historyData: PurchaseRow[] = data?.purchaseHistories?.purchases || [];
  const total = data?.purchaseHistories?.total || 0;

  return (
    <>
      {loading && <>Loading...</>}
      {error && <>{error.message}</>}
      {!loading && !error && historyData.length === 0 && (
        <Alert message="No purchase history found!" type="info" showIcon />
      )}
      {!loading && !error && historyData.length > 0 && (
        <Table<PurchaseRow>
          loading={loading}
          tableLayout="fixed"
          dataSource={historyData}
          columns={columns}
          rowKey="purchaseId"
          onRow={getRowProps}
          rowClassName={getRowClassName}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize });
            },
          }}
          scroll={{ x: "max-content" }}
          sticky
        />
      )}
    </>
  );
};

export default PurchaseHistoryTable;
