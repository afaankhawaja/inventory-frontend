import { Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import styled from "styled-components";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useAtom } from "jotai";
import { currentUserDataAtom } from "../../store/atoms";
import {
  SingleLineCell,
  useInlineRowExpand,
} from "../../components/ExpandedRowDetail";

const EditButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: darkgreen;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    color: #32cd32;
  }
`;
const DeleteButton = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: red;
  cursor: pointer;
  white-space: nowrap;
  &:hover {
    color: #8b0000;
  }
`;

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
  const { getRowProps, getRowClassName } = useInlineRowExpand<User>(
    (r) => r.userId,
  );

  const columns: ColumnsType<User> = [
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
      width: 120,
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      width: 120,
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 155,
      sorter: (a, b) => (a.username || "").localeCompare(b.username || ""),
      render: (text: string) => (
        <SingleLineCell style={{ fontWeight: 500 }}>
          {text || "—"}
        </SingleLineCell>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 215,
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 145,
      render: (text: string) => <SingleLineCell>{text || "—"}</SingleLineCell>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 135,
      render: (role: Role | null) => {
        if (!role?.name) return "—";
        return (
          <Tag color="gold" style={{ margin: 0, background: "transparent", border: "none", padding: 0, fontWeight: 600 }}>
            {role.name}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 95,
      render: (value: boolean | null) =>
        value === true ? (
          <Tag color="green" style={{ margin: 0 }}>
            Active
          </Tag>
        ) : (
          <Tag color="red" style={{ margin: 0 }}>
            Inactive
          </Tag>
        ),
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      width: 70,
      align: "center",
      render: (val: number) => <SingleLineCell>{val ?? "—"}</SingleLineCell>,
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 110,
      sorter: (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (val: string) => <SingleLineCell>{formatDate(val)}</SingleLineCell>,
    },
    {
      title: "Action",
      key: "action",
      width: userData?.role === "super-admin" ? 145 : 85,
      render: (record: User) =>
        userData?.role === "super-admin" ? (
          <Space size="middle" onClick={(e) => e.stopPropagation()}>
            <EditButton onClick={() => onEditUser(record.userId)}>
              <span>Edit</span> <EditOutlined />
            </EditButton>
            <DeleteButton onClick={() => onDeleteUser(record.userId)}>
              <span>Delete</span> <DeleteOutlined />
            </DeleteButton>
          </Space>
        ) : userData?.role === "admin" ? (
          <Space size="middle" onClick={(e) => e.stopPropagation()}>
            <EditButton onClick={() => onEditUser(record.userId)}>
              <span>Edit</span> <EditOutlined />
            </EditButton>
          </Space>
        ) : null,
    },
  ];

  const getVisibleColumns = (role: string | null) => {
    if (role === "admin" || role === "super-admin") {
      return columns;
    }
    return columns.filter((column) => column.key !== "action");
  };
  const visibleColumns = getVisibleColumns(userData?.role);

  return (
    <Table<User>
      rowKey="userId"
      tableLayout="fixed"
      pagination={pagination}
      dataSource={dataSource}
      columns={visibleColumns}
      onRow={getRowProps}
      rowClassName={getRowClassName}
      sticky
      scroll={{ x: "max-content", y: "calc(100vh - 340px)" }}
    />
  );
};

export default UserTable;
