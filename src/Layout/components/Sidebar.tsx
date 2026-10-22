import React from "react";
import {
  FileDoneOutlined,
  HomeOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
import { useNavigate } from "react-router";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  logoutUser: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, logoutUser }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        backgroundColor: colorBgContainer,
        borderRadius: "0px 8px 8px 0px",
      }}
    >
      <div className="demo-logo-vertical" />
      <Menu
        style={{ paddingTop: "64px", borderRadius: "0px 8px 8px 0px" }}
        mode="inline"
        defaultSelectedKeys={["1"]}
        onClick={({ key }) => {
          if (key === "logout") {
            logoutUser();
          } else navigate(key);
        }}
        items={[
          {
            key: "/",
            icon: <HomeOutlined />,
            label: "Home",
          },
          {
            key: "/inventory-list",
            icon: <UnorderedListOutlined />,
            label: "Inventory List",
          },
          {
            key: "/purchase-history",
            icon: <ShoppingCartOutlined />,
            label: "Purchase History",
          },
          {
            key: "/reports",
            icon: <FileDoneOutlined />,
            label: "Reports",
          },
          {
            key: "/maintenance",
            icon: <SettingOutlined />,
            label: "Maintenance",
          },
          {
            key: "/users",
            icon: <UserOutlined />,
            label: "Users",
          },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Log Out",
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
