import { Table, Alert } from "antd";
import { useQuery } from "@apollo/client";
import { FETCH_ALL_PURCHASES } from "../graphql/queries";
import { useState } from "react";

interface PurchaseRecord {
  purchaseId: string;
  purchase_date: string;
  quantity: number;
  unit_price: string;
  total_cost: string;
  item: {
    name: string;
  };
  vendor: {
    name: string;
  };
  created_at: string;
  updated_at: string;
}

const PurchaseHistoryTable: React.FC = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const { loading, error, data } = useQuery(FETCH_ALL_PURCHASES, {
    variables: {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    },
    fetchPolicy: "network-only",
  });

  const purchases: PurchaseRecord[] = data?.purchaseHistories?.purchases || [];
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
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Item",
      dataIndex: ["item", "name"],
      key: "itemName",
    },
    {
      title: "Vendor",
      dataIndex: ["vendor", "name"],
      key: "vendor",
      width: 150,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
    },
    {
      title: "Unit Price",
      dataIndex: "unit_price",
      key: "unit_price",
      width: 120,
    },
    {
      title: "Total Cost",
      dataIndex: "total_cost",
      key: "total_cost",
      width: 120,
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Updated At",
      dataIndex: "updated_at",
      key: "updated_at",
      render: (d: string) => new Date(d).toLocaleDateString(),
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
        <Table
          rowKey="purchaseId"
          loading={loading}
          dataSource={purchases}
          columns={columns}
          sticky
          scroll={{ x: "max-content" }}
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
