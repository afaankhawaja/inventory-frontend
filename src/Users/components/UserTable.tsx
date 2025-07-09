import { Space, Table, Tag } from "antd";

interface User {
  userId: string;
  key: string;
  username: string;
  phone: string;
  email: string;
  is_active: boolean | null;
  created_at: string;
  age: number;
  role: Role | null;
}

interface Role {
  roleId: string;
  name: string;
  description: string | null;
}

interface UserTableProps {
  dataSource?: User[];
  onViewUser: (userId: string) => void;
}

interface CreatedAtType {
  key: string;
  created_at: string;
}

interface UserNameType {
  key: string;
  username: string;
}

const UserTable = ({ dataSource, onViewUser }: UserTableProps) => {
  const columns = [
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      sorter: (a: UserNameType, b: UserNameType) =>
        a.username.localeCompare(b.username),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (value: null | true) => {
        if (value === true) {
          return <Tag color="green">Active</Tag>;
        } else if (value === null) {
          return <Tag color="red">Inactive</Tag>;
        }
      },
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: Role | null) => {
        if (role === null) return;
        return <Tag color="yellow">{role.name}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a: CreatedAtType, b: CreatedAtType) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Action",
      key: "action",
      render: (record: User) => (
        <Space size="middle">
          <a onClick={() => onViewUser(record.userId)}>Edit</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  return <Table dataSource={dataSource} columns={columns} />;
};

export default UserTable;
