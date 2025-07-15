import { Table } from "antd";

interface Transaction {
  transaction_type: string;
  name: string;
  username: string;
  transaction_date: string;
  price: number;
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

const HighValueAssetTable = ({
  dataSource,
  pagination,
}: TransactionTableProps) => {
  const columns = [
    {
      title: "Transaction Type",
      dataIndex: "transaction_type",
      key: "transaction_type",
    },
    {
      title: "Transaction Date",
      dataIndex: "transaction_date",
      key: "transaction_date",
    },
    {
      title: "Username",
      dataIndex: ["user", "username"],
      key: "username",
    },
    {
      title: "Item",
      dataIndex: ["transactionItems", 0, "item", "name"],
      key: "name",
    },
    {
      title: "Price",
      dataIndex: ["transactionItems", 0, "item", "price"],
      key: "price",
    },
  ];

  return (
    <Table columns={columns} dataSource={dataSource} pagination={pagination} />
  );
};

export default HighValueAssetTable;
