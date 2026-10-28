import { Table, Tag, Alert, Select, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery } from "@apollo/client";
import { GET_MAINTENANCE_SCHEDULES } from "../graphql/queries";
import { UPDATE_STATUS } from "../graphql/mutations";
import { useState } from "react";
import { useAtom } from "jotai";
import { currentUserDataAtom } from "../../store/atoms";
import {
  SingleLineCell,
  useInlineRowExpand,
} from "../../components/ExpandedRowDetail";

interface RecordType {
  maintenance_schedule_ID: string;
  maintenance_type: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  item?: {
    name?: string;
    condition?: string;
  };
  user?: {
    username?: string;
  };
}

const statusOptions = [
  { label: "SCHEDULED", value: "SCHEDULED" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "DUE", value: "DUE" },
];

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
};

const MaintenanceSchedulesTable = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const { getRowProps, getRowClassName } = useInlineRowExpand<RecordType>(
    (r) => r.maintenance_schedule_ID,
  );
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

  const schedules: RecordType[] =
    data?.maintenanceSchedules?.maintenanceSchedules || [];
  const total = data?.maintenanceSchedules?.total || 0;

  const columns: ColumnsType<RecordType> = [
    {
      title: "Item Name",
      dataIndex: ["item", "name"],
      key: "item_name",
      width: 240,
      render: (text: string) => (
        <SingleLineCell style={{ fontWeight: 500 }}>
          {text || "—"}
        </SingleLineCell>
      ),
    },
    {
      title: "Type",
      dataIndex: "maintenance_type",
      key: "maintenance_type",
      width: 130,
      render: (text: string) => (
        <Tag
          color={text === "CORRECTIVE" ? "volcano" : "geekblue"}
          style={{
            fontSize: "12px",
            fontWeight: 600,
            borderRadius: 999,
            padding: "2px 10px",
            margin: 0,
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
      width: 155,
      render: (status: string, record: RecordType) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={status}
            options={statusOptions}
            loading={mutLoading}
            onChange={(newStatus) => {
              updateMaintenanceSchedule({
                variables: {
                  maintenance_schedule_ID: record.maintenance_schedule_ID,
                  statusCheck:
                    newStatus === "COMPLETED" ? "REPAIRED" : "DAMAGED",
                  status: newStatus,
                  userId: userID,
                },
              });
            }}
            style={{ width: 135 }}
          />
        </div>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      width: 260,
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Assigned To",
      dataIndex: ["user", "username"],
      key: "username",
      width: 145,
      render: (text: string) => (
        <SingleLineCell>{text || "system"}</SingleLineCell>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      render: (date: string) => <SingleLineCell>{formatDate(date)}</SingleLineCell>,
    },
    {
      title: "Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      width: 110,
      render: (date: string) => <SingleLineCell>{formatDate(date)}</SingleLineCell>,
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
        <Table<RecordType>
          rowKey="maintenance_schedule_ID"
          tableLayout="fixed"
          loading={loading || mutLoading}
          dataSource={schedules}
          columns={columns}
          onRow={getRowProps}
          rowClassName={getRowClassName}
          sticky
          scroll={{ x: "max-content", y: "calc(100vh - 310px)" }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize });
            },
          }}
        />
      )}
    </>
  );
};

export default MaintenanceSchedulesTable;
