import { Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  SingleLineCell,
  useInlineRowExpand,
} from "../../components/ExpandedRowDetail";

interface Transaction {
  transactionId?: string;
  transaction_type: string;
  quantity?: number;
  transaction_date: string;
  user?: {
    userId?: string;
    username?: string;
  };
  transactionItems?: {
    item?: {
      itemId?: string;
      name?: string;
      price?: number;
      is_high_value?: boolean;
    };
  }[];
}
interface PaginationType {
  current: number;
  pageSize: number;
  total: number;
  onChange: (page: number, pageSize: number) => void;
}
interface TransactionTableProps {
  dataSource: Transaction[];
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

const HighValueAssetTable = ({
  dataSource,
  pagination,
}: TransactionTableProps) => {
  const { getRowProps, getRowClassName } = useInlineRowExpand<Transaction>(
    (r) =>
      r.transactionId ||
      `${r.transaction_date}-${r.transactionItems?.[0]?.item?.name}`,
  );

  const columns: ColumnsType<Transaction> = [
    {
      title: "Item",
      dataIndex: ["transactionItems", 0, "item", "name"],
      key: "name",
      width: 260,
      render: (text: string) => (
        <SingleLineCell style={{ fontWeight: 500 }}>
          {text || "—"}
        </SingleLineCell>
      ),
    },
    {
      title: "Type",
      dataIndex: "transaction_type",
      key: "transaction_type",
      width: 120,
      render: (val: string) => (
        <Tag
          color={val === "CHECK_OUT" ? "orange" : "green"}
          style={{ margin: 0 }}
        >
          {val}
        </Tag>
      ),
    },
    {
      title: "Custodian",
      dataIndex: ["user", "username"],
      key: "username",
      width: 150,
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      width: 75,
      align: "center",
      render: (val: number) => <SingleLineCell>{val ?? 1}</SingleLineCell>,
    },
    {
      title: "Unit Valuation",
      dataIndex: ["transactionItems", 0, "item", "price"],
      key: "price",
      width: 135,
      align: "right",
      render: (val: number) => (
        <SingleLineCell style={{ fontWeight: 600 }}>
          {formatCurrency(val)}
        </SingleLineCell>
      ),
    },
    {
      title: "Date",
      dataIndex: "transaction_date",
      key: "transaction_date",
      width: 120,
      render: (val: string) => <SingleLineCell>{formatDate(val)}</SingleLineCell>,
    },
  ];

  return (
    <Table<Transaction>
      rowKey={(r, i) => r.transactionId || String(i)}
      tableLayout="fixed"
      columns={columns}
      dataSource={dataSource}
      pagination={pagination}
      onRow={getRowProps}
      rowClassName={getRowClassName}
      scroll={{ x: "max-content" }}
      sticky
    />
  );
};

export default HighValueAssetTable;
