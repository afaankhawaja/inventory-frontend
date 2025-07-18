import React, { useState } from "react";
import { Table, Alert } from "antd";
import { useQuery } from "@apollo/client";
import { GET_ALL_PURCHASE_HISTORY } from "../graphql/queries";

const columns = [
  {
    title: "Purchase ID",
    dataIndex: "purchaseId",
    key: "purchaseId",
  },
  {
    title: "Date",
    dataIndex: "purchase_date",
    key: "purchase_date",
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
  {
    title: "Quantity",
    dataIndex: "quantity",
    key: "quantity",
    width: 120,
  },
  {
    title: "Unit Price",
    dataIndex: "unit_price",
    key: "unit_price",
    width: 120,
    render: (price: number) => price || "-",
  },
  {
    title: "Total Cost",
    dataIndex: "total_cost",
    key: "total_cost",
    width: 120,
    render: (cost: number) => cost || "-",
  },
  {
    title: "Item",
    dataIndex: ["item", "name"],
    key: "item",
  },
  {
    title: "Vendor",
    dataIndex: ["vendor", "name"],
    key: "vendor",
    width: 120,
  },
];

const PurchaseHistoryTable: React.FC = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const { loading, error, data } = useQuery(GET_ALL_PURCHASE_HISTORY, {
    variables: {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    },
  });
  const historyData = data?.purchaseHistories?.purchases || [];
  const total = data?.purchaseHistories?.total || 0;

  return (
    <>
      {loading && <>Loading...</>}
      {error && <>{error.message}</>}
      {!loading && !error && historyData.length === 0 && (
        <Alert message="No purchase history found!" type="info" showIcon />
      )}
      {!loading && !error && historyData.length > 0 && (
        <Table
          loading={loading}
          dataSource={historyData}
          columns={columns}
          rowKey="purchaseId"
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
