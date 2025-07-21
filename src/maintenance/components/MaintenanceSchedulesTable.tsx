import { Table, Tag, Alert, Select, message } from "antd";
import { useMutation, useQuery } from "@apollo/client";
import { GET_MAINTENANCE_SCHEDULES } from "../graphql/queries";
import { UPDATE_STATUS } from "../graphql/mutations";
import { useState } from "react";
import { useAtom } from "jotai";
import { currentUserDataAtom } from "../../store/atoms";

interface RecordType {
  maintenance_schedule_ID: string;
  status: string;
}

const statusOptions = [
  { label: "SCHEDULED", value: "SCHEDULED" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "DUE", value: "DUE" },
];

const MaintenanceSchedulesTable = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  const [user] = useAtom(currentUserDataAtom);
  const userID = user?.userID;
  const { loading, error, data, refetch } = useQuery(
    GET_MAINTENANCE_SCHEDULES,
    {
      variables: {
        skip: (pagination.current - 1) * pagination.pageSize,
        take: pagination.pageSize,
      },
      pollInterval: 60000,
      fetchPolicy: "network-only",
    },
  );

  const [updateMaintenanceSchedule, { loading: mutLoading }] = useMutation(
    UPDATE_STATUS,
    {
      onCompleted: () => {
        message.success("Status updated successfully");
        refetch();
      },
      onError: (err) => message.error(`Update failed: ${err.message}`),
    },
  );

  const schedules = data?.maintenanceSchedules?.maintenanceSchedules || [];
  const total = data?.maintenanceSchedules?.total || 0;

  const columns = [
    {
      title: "Maintenance Type",
      dataIndex: "maintenance_type",
      key: "maintenance_type",
      render: (text: string) => (
        <Tag
          style={{
            fontSize: "16px",
            width: "140px",
            height: "30px",
            alignContent: "center",
            textAlign: "center",
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: RecordType) => (
        <Select
          value={status}
          options={statusOptions}
          loading={mutLoading}
          onChange={(newStatus) => {
            updateMaintenanceSchedule({
              variables: {
                maintenance_schedule_ID: record.maintenance_schedule_ID,
                statusCheck: newStatus === "COMPLETED" ? "REPAIRED" : "DAMAGED",
                status: newStatus,
                userId: userID,
              },
            });
          }}
          className=""
          style={{
            width: 140,
          }}
        />
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (text: string) => text || "-",
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Updated At",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Item Name",
      dataIndex: ["item", "name"],
      key: "item_name",
    },
    {
      title: "Username",
      dataIndex: ["user", "username"],
      key: "username",
      render: (text: string) => text || "system",
    },
  ];

  return (
    <>
      {loading && <>loading...</>}
      {error && <>{error.message}</>}
      {!loading && !error && schedules.length === 0 && (
        <Alert message="No maintenance schedules found!" type="info" showIcon />
      )}
      {!loading && !error && schedules.length > 0 && (
        <Table
          loading={loading || mutLoading}
          dataSource={schedules}
          columns={columns}
          sticky={true}
          scroll={{ x: "max-content" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize });
            },
          }}
          rowKey="maintenance_schedule_ID"
        />
      )}
    </>
  );
};

export default MaintenanceSchedulesTable;
