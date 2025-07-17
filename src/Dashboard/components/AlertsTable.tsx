import { Table, Tag, Alert } from "antd";
import { useQuery } from "@apollo/client";
import { GET_ALL_ALERTS } from "../graphql/queries";
import { useState } from "react";

const getTagColor = (type: string) => {
  switch (type) {
    case "expiry":
      return "volcano";
    case "low stock":
      return "orange";
    case "info":
      return "blue";
    default:
      return "default";
  }
};

const columns = [
  {
    title: "Alert Type",
    dataIndex: "alert_type",
    key: "type",
    render: (text: string) => (
      <Tag color={getTagColor(text)}>
        {text ? text.toUpperCase().replace("_", " ") : ""}
      </Tag>
    ),
  },
  {
    title: "Message",
    dataIndex: "message",
    key: "message",
    render: (text: string) => text,
  },
  {
    title: "Date",
    dataIndex: "alert_date",
    key: "date",
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
  {
    title: "Severity",
    dataIndex: "severity",
    key: "severity",
  },
  {
    title: "Item",
    dataIndex: ["itemAlerts", 0, "item", "name"],
    key: "itemAlerts",
  },
];

const AlertsTable = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  const { loading, error, data } = useQuery(GET_ALL_ALERTS, {
    variables: {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    },
    pollInterval: 60000,
    fetchPolicy: "network-only",
  });
  const alertsData = data?.alerts?.alerts;
  return (
    <>
      {loading && <>loading...</>}
      {error && <>{error.message}</>}
      {!loading && !error && alertsData.length === 0 && (
        <Alert message="No new alerts!" type="info" showIcon />
      )}
      {!loading && !error && alertsData.length > 0 && (
        <Table
          loading={loading}
          dataSource={alertsData}
          columns={columns}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.alerts?.total,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
          scroll={{ x: "max-content" }}
          sticky={true}
        />
      )}
    </>
  );
};

export default AlertsTable;
