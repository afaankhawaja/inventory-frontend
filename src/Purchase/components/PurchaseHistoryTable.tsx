import { Table, Alert, Card, Skeleton } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@apollo/client";
import { FETCH_ALL_PURCHASES } from "../graphql/queries";
import { useState } from "react";
import { SingleLineCell } from "../../components/ExpandedRowDetail";
import DetailDrawer, { TitleLink } from "../../components/DetailDrawer";

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
  const [detail, setDetail] = useState<PurchaseRecord | null>(null);

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
      title: "Date",
      dataIndex: "purchase_date",
      key: "purchase_date",
      width: 115,
      render: (d: string) => <SingleLineCell>{formatDate(d)}</SingleLineCell>,
    },
    {
      title: "Item",
      dataIndex: ["item", "name"],
      key: "itemName",
      render: (text: string, record: PurchaseRecord) => (
        <TitleLink onClick={() => setDetail(record)} title="View details">
          {text || "-"}
        </TitleLink>
      ),
    },
    {
      title: "Vendor",
      dataIndex: ["vendor", "name"],
      key: "vendor",
      width: 180,
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 70,
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
      width: 145,
      align: "right",
      render: (val: string | number) => (
        <SingleLineCell style={{ fontWeight: 600 }}>
          {formatCurrency(val)}
        </SingleLineCell>
      ),
    },
  ];

  return (
    <>
      <DetailDrawer
        open={!!detail}
        title={detail?.item?.name}
        onClose={() => setDetail(null)}
        fields={[
          { label: "Purchase ID", value: detail?.purchaseId },
          { label: "Purchase Date", value: formatDate(detail?.purchase_date) },
          { label: "Vendor", value: detail?.vendor?.name || "-" },
          { label: "Quantity", value: detail?.quantity ?? "-" },
          { label: "Unit Price", value: formatCurrency(detail?.unit_price) },
          { label: "Total Cost", value: formatCurrency(detail?.total_cost) },
          { label: "Created At", value: formatDate(detail?.created_at) },
          { label: "Updated At", value: formatDate(detail?.updated_at) },
        ]}
      />
      {loading && (
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      )}
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
          rowClassName={() => "row-static"}
          sticky
          scroll={{ x: 900, y: "calc(100vh - 310px)" }}
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
