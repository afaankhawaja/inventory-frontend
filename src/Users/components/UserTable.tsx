import { useState } from "react";
import { Avatar, Grid, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined, EditOutlined, UserOutlined } from "@ant-design/icons";
import { useAtom } from "jotai";
import { currentUserDataAtom } from "../../store/atoms";
import { SingleLineCell } from "../../components/ExpandedRowDetail";
import { TitleLink } from "../../components/DetailDrawer";
import RowActions, { type RowAction } from "../../components/RowActions";
import UserDetailDrawer from "../../components/UserDetailDrawer";

interface Role {
  roleId: string;
  name: string;
  description: string | null;
}

interface User {
  userId: string;
  key: string;
  first_name?: string;
  last_name?: string;
  username: string;
  phone: string;
  email: string;
  is_active: boolean | null;
  created_at: string;
  age: number;
  cnic?: string | null;
  updated_at?: string;
  image_path?: string | null;
  role: Role | null;
}

interface paginationProps {
  current: number;
  pageSize: number;
  total: number;
  onChange: (current: number, pageSize: number) => void;
}

interface UserTableProps {
  dataSource?: User[];
  pagination: paginationProps;
  onEditUser: (userID: string) => void;
  onDeleteUser: (userID: string) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
};

const UserTable = ({
  dataSource,
  onEditUser,
  onDeleteUser,
  pagination,
}: UserTableProps) => {
  const [userData] = useAtom(currentUserDataAtom);
  const [detail, setDetail] = useState<User | null>(null);
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;

  const role = userData?.role;
  const canManage = role === "admin" || role === "super-admin";

  const columns: ColumnsType<User> = [
    {
      title: isMobile ? "User" : "First Name",
      key: "first_name",
      dataIndex: "first_name",
      width: isMobile ? undefined : 160,
      render: (_: string, record: User) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <Avatar
            size={isMobile ? 26 : 28}
            src={record.image_path || undefined}
            icon={<UserOutlined />}
            style={{ flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <TitleLink onClick={() => setDetail(record)} title="View details">
              {isMobile
                ? [record.first_name, record.last_name].filter(Boolean).join(" ") ||
                  record.username ||
                  "—"
                : record.first_name || "—"}
            </TitleLink>
            {isMobile && (
              <div
                style={{
                  fontSize: 11,
                  opacity: 0.6,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {record.email || record.username}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      width: 110,
      responsive: ["md"],
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 140,
      responsive: ["md"],
      sorter: (a, b) => (a.username || "").localeCompare(b.username || ""),
      render: (text: string) => (
        <SingleLineCell style={{ fontWeight: 500 }}>{text || "—"}</SingleLineCell>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 210,
      responsive: ["md"],
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      responsive: ["md"],
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: isMobile ? 96 : 120,
      responsive: ["md"],
      render: (r: Role | null) =>
        r?.name ? <Tag style={{ margin: 0 }}>{r.name}</Tag> : "—",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: isMobile ? 76 : 90,
      render: (value: boolean | null) => (
        <Tag color={value === true ? "green" : "red"} style={{ margin: 0 }}>
          {value === true ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: 60,
      align: "center",
      responsive: ["md"],
      render: (val: number) => <SingleLineCell>{val ?? "—"}</SingleLineCell>,
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 105,
      responsive: ["md"],
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (val: string) => <SingleLineCell>{formatDate(val)}</SingleLineCell>,
    },
    {
      title: "Action",
      key: "action",
      width: isMobile ? 48 : 64,
      align: "center",
      fixed: isMobile ? undefined : "right",
      render: (record: User) => {
        const actions: RowAction[] = [
          {
            key: "edit",
            label: "Edit",
            icon: <EditOutlined />,
            onClick: () => onEditUser(record.userId),
          },
        ];
        if (role === "super-admin") {
          actions.push({
            key: "delete",
            label: "Delete",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => onDeleteUser(record.userId),
          });
        }
        return <RowActions actions={actions} />;
      },
    },
  ];

  const visibleColumns = canManage
    ? columns
    : columns.filter((column) => column.key !== "action");

  return (
    <>
      <Table<User>
        rowKey="userId"
        pagination={{
          ...pagination,
          size: isMobile ? "small" : "default",
        }}
        dataSource={dataSource}
        columns={visibleColumns}
        onRow={(record) => ({
          onClick: () => setDetail(record),
          style: { cursor: "pointer" },
        })}
        sticky={!isMobile}
        scroll={isMobile ? undefined : { x: 1190, y: "calc(100vh - 340px)" }}
      />
      <UserDetailDrawer
        user={detail}
        onClose={() => setDetail(null)}
        onEdit={canManage ? onEditUser : undefined}
      />
    </>
  );
};
export default UserTable;
