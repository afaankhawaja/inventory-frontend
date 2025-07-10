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
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Menu,
  theme,
  type MenuProps,
} from "antd";
import { useNavigate } from "react-router";
import { Outlet } from "react-router";
import CurrentUser from "../../utils/CurrentUser";
import { useQuery } from "@apollo/client";
import { FETCH_USER_BY_USERNAME } from "../graphql/queries";
import styled from "styled-components";

const UserWrapper = styled.div`
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.strong``;
const UserEmail = styled.div``;
const { Header, Sider, Content } = Layout;

const HomeLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const navigate = useNavigate();
  const username = CurrentUser();
  const { data } = useQuery(FETCH_USER_BY_USERNAME, {
    variables: { username: username },
  });
  const base64Url = data?.username?.image_path;
  const defaultIcon = "../../../assets/images/user.png";
  const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/signin");
  };
  const items: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: (
        <UserWrapper>
          <UserName>{username}</UserName>
          <UserEmail>{data?.username?.email}</UserEmail>
        </UserWrapper>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
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
    <Layout>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          backgroundColor: colorBgContainer,
          border: "1px solid lightblue",
          borderRadius: "0px 8px 8px 0px",
          boxShadow: "5px 5px lightblue",
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
        <Header
          style={{
            padding: 10,
            background: colorBgContainer,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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

          <Dropdown menu={{ items }} placement="bottomRight" arrow>
            <Avatar
              size={{ xs: 24, sm: 32, md: 32, lg: 36, xl: 40, xxl: 54 }}
              src={base64Url ? base64Url : defaultIcon}
            />
          </Dropdown>
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
