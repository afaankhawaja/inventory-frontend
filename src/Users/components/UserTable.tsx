import { useState } from "react";
import { Avatar, Table, Tag } from "antd";
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

  const role = userData?.role;
  const canManage = role === "admin" || role === "super-admin";

  const columns: ColumnsType<User> = [
    {
      title: "First Name",
      key: "first_name",
      dataIndex: "first_name",
      width: 160,
      render: (_: string, record: User) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar
            size={28}
            src={record.image_path || undefined}
            icon={<UserOutlined />}
          />
          <TitleLink onClick={() => setDetail(record)} title="View details">
            {record.first_name || "—"}
          </TitleLink>
        </div>
      ),
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      width: 110,
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 140,
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
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (r: Role | null) =>
        r?.name ? <Tag style={{ margin: 0 }}>{r.name}</Tag> : "—",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 90,
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
      render: (val: number) => <SingleLineCell>{val ?? "—"}</SingleLineCell>,
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 105,
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (val: string) => <SingleLineCell>{formatDate(val)}</SingleLineCell>,
    },    {
      title: "Action",
      key: "action",
      width: 64,
      align: "center",
      fixed: "right",
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
        pagination={pagination}
        dataSource={dataSource}
        columns={visibleColumns}
        onRow={(record) => ({
          onClick: () => setDetail(record),
          style: { cursor: "pointer" },
        })}
        sticky
        scroll={{ x: 1190, y: "calc(100vh - 340px)" }}
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
