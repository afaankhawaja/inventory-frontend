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
import { useLocation, useNavigate } from "react-router";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  logoutUser: () => void;
}

const navItems = [
  { key: "/", icon: <HomeOutlined />, label: "Home" },
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
  { key: "/reports", icon: <FileDoneOutlined />, label: "Reports" },
  { key: "/maintenance", icon: <SettingOutlined />, label: "Maintenance" },
  { key: "/users", icon: <UserOutlined />, label: "Users" },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, logoutUser }) => {
  const {
    token: { colorBgContainer, colorBorderSecondary, colorPrimary, colorText },
  } = theme.useToken();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Highlight the nav item matching the current route (longest prefix wins)
  const selectedKey =
    navItems
      .map((i) => i.key)
      .filter((k) => (k === "/" ? pathname === "/" : pathname.startsWith(k)))
      .sort((a, b) => b.length - a.length)[0] ?? "";

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme="light"
      width={232}
      style={{
        backgroundColor: colorBgContainer,
        borderRight: `1px solid ${colorBorderSecondary}`,
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "0 8px",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? 0 : "0 16px",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "-0.02em",
            color: colorText,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          <span style={{ color: colorPrimary }}>●</span>
          {!collapsed && <span style={{ marginLeft: 10 }}>Inventory</span>}
        </div>
        <Menu
          style={{ borderInlineEnd: "none", background: "transparent", flex: 1 }}
          mode="inline"
          theme="light"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(key)}
          items={navItems}
        />
        <Menu
          style={{
            borderInlineEnd: "none",
            background: "transparent",
            borderTop: `1px solid ${colorBorderSecondary}`,
            paddingTop: 8,
            marginBottom: 8,
          }}
          mode="inline"
          theme="light"
          selectable={false}
          onClick={() => logoutUser()}
          items={[
            {
              key: "logout",
              icon: <LogoutOutlined />,
              label: "Log Out",
              danger: true,
            },
          ]}
        />
      </div>
    </Sider>
  );
};

export default Sidebar;
