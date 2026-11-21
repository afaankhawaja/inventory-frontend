import React from "react";
import { Avatar, Button, Descriptions, Drawer, Tag } from "antd";
import { EditOutlined, UserOutlined } from "@ant-design/icons";
import styled from "styled-components";

const ProfileCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  padding: 24px 16px;
  margin-bottom: 20px;
  border-radius: 16px;
  border: 1px solid rgba(128, 128, 128, 0.2);
`;

const FullName = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-top: 8px;
`;

const Handle = styled.div`
  opacity: 0.65;
  font-size: 13px;
`;

export interface UserDetail {
  userId: string;
  first_name?: string;
  last_name?: string;
  username: string;
  phone?: string;
  email?: string;
  is_active: boolean | null;
  created_at?: string;
  age?: number;
  cnic?: string | null;
  updated_at?: string;
  image_path?: string | null;
  role: { name: string } | null;
}

interface UserDetailDrawerProps {
  user: UserDetail | null;
  onClose: () => void;
  onEdit?: (userId: string) => void;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString();
};

const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  user,
  onClose,
  onEdit,
}) => {
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    "";

  return (
    <Drawer
      open={!!user}
      title="User details"
      onClose={onClose}
      width={420}
      destroyOnClose
      footer={
        onEdit && user ? (
          <Button
            type="primary"
            block
            icon={<EditOutlined />}
            onClick={() => {
              onEdit(user.userId);
              onClose();
            }}
          >
            Edit user
          </Button>
        ) : null
      }
    >
      {user && (
        <>
          <ProfileCard>
            <Avatar
              size={96}
              src={user.image_path || undefined}
              icon={<UserOutlined />}
            />
            <FullName>{fullName}</FullName>
            <Handle>@{user.username}</Handle>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              {user.role?.name && <Tag style={{ margin: 0 }}>{user.role.name}</Tag>}
              <Tag
                color={user.is_active ? "green" : "red"}
                style={{ margin: 0 }}
              >
                {user.is_active ? "Active" : "Inactive"}
              </Tag>
            </div>
          </ProfileCard>

          <Descriptions
            column={1}
            bordered
            size="small"
            labelStyle={{ width: 130 }}
            contentStyle={{ overflowWrap: "anywhere" }}
          >
            <Descriptions.Item label="First name">{user.first_name || "—"}</Descriptions.Item>
            <Descriptions.Item label="Last name">{user.last_name || "—"}</Descriptions.Item>
            <Descriptions.Item label="Username">{user.username || "—"}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email || "—"}</Descriptions.Item>
            <Descriptions.Item label="Phone">{user.phone || "—"}</Descriptions.Item>
            <Descriptions.Item label="CNIC">{user.cnic || "—"}</Descriptions.Item>
            <Descriptions.Item label="Role">{user.role?.name || "—"}</Descriptions.Item>
            <Descriptions.Item label="Status">{user.is_active ? "Active" : "Inactive"}</Descriptions.Item>
            <Descriptions.Item label="Age">{user.age ?? "—"}</Descriptions.Item>
            <Descriptions.Item label="Created">
              {formatDate(user.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Last updated">
              {formatDate(user.updated_at)}
            </Descriptions.Item>
            <Descriptions.Item label="User ID">{user.userId}</Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Drawer>
  );
};

export default UserDetailDrawer;
