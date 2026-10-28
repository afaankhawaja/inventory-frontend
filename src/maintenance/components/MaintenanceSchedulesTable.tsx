import { Table, Tag, Alert, Select, Card, Skeleton, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMutation, useQuery } from "@apollo/client";
import { GET_MAINTENANCE_SCHEDULES } from "../graphql/queries";
import { UPDATE_STATUS } from "../graphql/mutations";
import { useState } from "react";
import { useAtom } from "jotai";
import { currentUserDataAtom } from "../../store/atoms";
import { SingleLineCell } from "../../components/ExpandedRowDetail";
import DetailDrawer, { TitleLink } from "../../components/DetailDrawer";

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
  const [detail, setDetail] = useState<RecordType | null>(null);
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
      render: (text: string, record: RecordType) => (
        <TitleLink onClick={() => setDetail(record)} title="View details">
          {text || "-"}
        </TitleLink>
      ),
    },
    {
      title: "Type",
      dataIndex: "maintenance_type",
      key: "maintenance_type",
      width: 125,
      render: (text: string) => (
        <Tag
          color={text === "CORRECTIVE" ? "volcano" : "geekblue"}
          style={{
            fontSize: "12px",
            fontWeight: 600,
            margin: 0, padding: 0, background: "transparent", border: "none",
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
      width: 165,
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
      title: "Assigned To",
      dataIndex: ["user", "username"],
      key: "username",
      width: 130,
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
  ];

  return (
    <>
      <DetailDrawer
        open={!!detail}
        title={detail?.item?.name}
        onClose={() => setDetail(null)}
        fields={[
          { label: "Type", value: detail?.maintenance_type },
          { label: "Status", value: detail?.status },
          { label: "Item Condition", value: detail?.item?.condition || "-" },
          { label: "Assigned To", value: detail?.user?.username || "system" },
          { label: "Notes", value: detail?.notes || "-" },
          { label: "Created", value: formatDate(detail?.createdAt) },
          { label: "Updated", value: formatDate(detail?.updatedAt) },
        ]}
      />
      {loading && (
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      )}
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
          rowClassName={() => "row-static"}
          sticky
          scroll={{ x: 850, y: "calc(100vh - 310px)" }}
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
