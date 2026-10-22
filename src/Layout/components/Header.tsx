import React from "react";
import {
  EditOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Segmented,
  theme,
  type MenuProps,
} from "antd";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { useAtom } from "jotai";
import { selectedTheme } from "../.././store/themeAtom";

const { Header } = Layout;

const UserWrapper = styled.div`
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const Wrapper = styled.div`
  display: flex;
  gap: 0px 16px;
  justify-content: center;
  align-items: center;
`;
const UserName = styled.strong``;
const UserEmail = styled.div``;

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userData: {
    username: string;
    email: string;
    userID: string;
    image_path: string;
    role: string | null;
  };
  logoutUser: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  collapsed,
  setCollapsed,
  userData,
  logoutUser,
}) => {
  const {
    token: { colorBorderSecondary },
  } = theme.useToken();
  const navigate = useNavigate();
  const [currentTheme, setCurrentTheme] = useAtom(selectedTheme);

  const defaultIcon = "../../../assets/images/user.png";

  const items: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: (
        <UserWrapper>
          <UserName>{userData.username}</UserName>
          <UserEmail>{userData.email}</UserEmail>
        </UserWrapper>
      ),
      disabled: true,
    },
    {
      key: "edit",
      icon: <EditOutlined />,
      label: "Edit profile",
      onClick: () => {
        navigate("/edit-user-details");
      },
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: () => {
        logoutUser();
      },
    },
  ];

  return (
    <Header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        height: 64,
        padding: "0 16px",
        background: currentTheme.isDark
          ? "rgba(28, 28, 30, 0.8)"
          : "rgba(245, 245, 247, 0.8)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: `1px solid ${colorBorderSecondary}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: 16, width: 40, height: 40 }}
      />
      <Wrapper>
        <Segmented
          size="middle"
          value={currentTheme.isDark ? "Dark" : "Light"}
          options={["Light", "Dark"]}
          onChange={(v) => setCurrentTheme({ isDark: v === "Dark" })}
        />
        <Dropdown menu={{ items }} placement="bottomRight" arrow>
          <Avatar
            size={34}
            style={{ cursor: "pointer" }}
            src={userData?.image_path ? userData?.image_path : defaultIcon}
          />
        </Dropdown>
      </Wrapper>
    </Header>
  );
};

export default HeaderComponent;
