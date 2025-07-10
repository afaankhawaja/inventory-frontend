import { Space, Table, Tag } from "antd";
import styled from "styled-components";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useAtom } from "jotai";
import { currentUserDataAtom } from "../../store/atoms";

const EditButton = styled.div`
  display: flex;
  gap: 0px 10px;
  color: darkgreen;
  cursor: pointer;
  &:hover {
    color: #32cd32;
  }
`;
const DeleteButton = styled.div`
  display: flex;
  gap: 0px 10px;
  color: red;
  cursor: pointer;
  &:hover {
    color: #8b0000;
  }
`;

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
  onEditUser: (userID: string) => void;
  onDeleteUser: (userID: string) => void;
}

interface CreatedAtType {
  key: string;
  created_at: string;
}

interface UserNameType {
  key: string;
  username: string;
}

const UserTable = ({
  dataSource,
  onEditUser,
  onDeleteUser,
}: UserTableProps) => {
  const [userData] = useAtom(currentUserDataAtom);
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
      render: (record: User) =>
        userData?.role === "super-admin" ? (
          <Space size="middle">
            <EditButton onClick={() => onEditUser(record.userId)}>
              <>Edit</> <EditOutlined />
            </EditButton>
            <DeleteButton onClick={() => onDeleteUser(record.userId)}>
              <>Delete </>
              <DeleteOutlined />
            </DeleteButton>
          </Space>
        ) : userData?.role === "admin" ? (
          <Space size="middle">
            <EditButton onClick={() => onEditUser(record.userId)}>
              <>Edit</> <EditOutlined />
            </EditButton>
          </Space>
        ) : (
          <></>
        ),
    },
  ];

  const getVisibleColumns = (role: string | null) => {
    if (role === "admin" || role === "super-admin") {
      return columns;
    } else {
      return columns.filter((column) => column.key !== "action");
    }
  };
  const visibleColumns = getVisibleColumns(userData?.role);

  return <Table dataSource={dataSource} columns={visibleColumns} />;
};

export default UserTable;
