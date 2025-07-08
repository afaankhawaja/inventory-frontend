import React, { useState } from "react";
import {
  FileDoneOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { useNavigate } from "react-router";
import { Outlet } from "react-router";

const { Header, Sider, Content } = Layout;

const HomeLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  return (
    <Layout>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          backgroundColor: colorBgContainer,
          border: "1px solid #1890ff",
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
              localStorage.removeItem("access_token");
              localStorage.removeItem("refresh_token");
              navigate("/signin");
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
              key: "/add-item",
              icon: <PlusOutlined />,
              label: "Add Item",
            },
            {
              key: "/reports",
              icon: <FileDoneOutlined />,
              label: "Reports",
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
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomeLayout;
