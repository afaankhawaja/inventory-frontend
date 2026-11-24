import React, { useMemo } from "react";
import {
  FileDoneOutlined,
  HomeOutlined,
  LogoutOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Drawer, Layout, Menu, theme } from "antd";
import { useLocation, useNavigate } from "react-router";
import { useAtomValue } from "jotai";
import { currentUserDataAtom } from "../../store/atoms";

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  logoutUser: () => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const baseNavItems = [
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
  {
    key: "/users",
    icon: <UserOutlined />,
    label: "Users",
    roles: ["admin", "super-admin"],
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  logoutUser,
  isMobile = false,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const {
    token: { colorBgContainer, colorBorderSecondary, colorPrimary, colorText },
  } = theme.useToken();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const userData = useAtomValue(currentUserDataAtom);

  const navItems = useMemo(() => {
    const role = userData?.role;
    return baseNavItems
      .filter((item) => !item.roles || (role && item.roles.includes(role)))
      .map(({ roles: _roles, ...rest }) => rest);
  }, [userData?.role]);

  const selectedKey =
    navItems
      .map((i) => i.key)
      .filter((k) => (k === "/" ? pathname === "/" : pathname.startsWith(k)))
      .sort((a, b) => b.length - a.length)[0] ?? "";

  const effectiveCollapsed = isMobile ? false : collapsed;

  const sidebarContent = (
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
          justifyContent: effectiveCollapsed ? "center" : "flex-start",
          padding: effectiveCollapsed ? 0 : "0 16px",
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: "-0.02em",
          color: colorText,
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}
      >
        <span style={{ color: colorPrimary }}>●</span>
        {!effectiveCollapsed && <span style={{ marginLeft: 10 }}>Inventory</span>}
      </div>
      <Menu
        style={{ borderInlineEnd: "none", background: "transparent", flex: 1 }}
        mode="inline"
        theme="light"
        selectedKeys={[selectedKey]}
        onClick={({ key }) => {
          navigate(key);
          if (isMobile) onCloseMobile?.();
        }}
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
        onClick={() => {
          if (isMobile) onCloseMobile?.();
          logoutUser();
        }}
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
  );

  if (isMobile) {
    return (
      <Drawer
        placement="left"
        open={mobileOpen}
        onClose={onCloseMobile}
        width={248}
        closable={false}
        styles={{
          body: {
            padding: 0,
            backgroundColor: colorBgContainer,
            height: "100%",
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

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
      {sidebarContent}
    </Sider>
  );
};

export default Sidebar;
