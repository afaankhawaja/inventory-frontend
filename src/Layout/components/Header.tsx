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
import { useLocation, useNavigate } from "react-router";
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
const LeftWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const ScreenTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;
const Wrapper = styled.div`
  display: flex;
  gap: 0px 15px;
  justify-content: center;
  align-items: center;
`;
const UserName = styled.strong``;
const UserEmail = styled.div``;

const getPageTitle = (pathname: string): string => {
  if (pathname === "/") return "Overview";
  if (pathname.startsWith("/inventory-list")) return "Inventory List";
  if (pathname.startsWith("/purchase-history")) return "Purchase History";
  if (pathname.startsWith("/maintenance")) return "Maintenance Schedules";
  if (pathname.startsWith("/users")) return "Users";
  if (pathname.startsWith("/edit-user-details")) return "Edit Profile";
  if (pathname.startsWith("/reports")) return "Reports";
  return "Dashboard";
};

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
    token: { colorBorderSecondary, colorText },
  } = theme.useToken();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [currentTheme, setCurrentTheme] = useAtom(selectedTheme);

  const defaultIcon = "../../../assets/images/user.png";
  const pageTitle = getPageTitle(pathname);

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
        padding: "0 15px",
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
      <LeftWrapper>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{ fontSize: 16, width: 40, height: 40 }}
        />
        <ScreenTitle style={{ color: colorText }}>{pageTitle}</ScreenTitle>
      </LeftWrapper>
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
