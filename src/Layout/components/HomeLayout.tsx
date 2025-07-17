import React, { useEffect, useState } from "react";
import {
  EditOutlined,
  FileDoneOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PlusOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Layout,
  Menu,
  Switch,
  theme,
  type MenuProps,
} from "antd";
import { useNavigate } from "react-router";
import { Outlet } from "react-router";
import CurrentUser from "../../utils/CurrentUser";
import { useQuery } from "@apollo/client";
import { FETCH_USER_BY_USERNAME } from "../graphql/queries";
import styled from "styled-components";
import { currentUserDataAtom } from "../../store/atoms";
import { useAtom } from "jotai";
import { selectedTheme } from "../../store/themeAtom";

const UserWrapper = styled.div`
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;
const Wrapper = styled.div`
  display: flex;
  gap: 0px 50px;
  justify-content: center;
  justify-items: center;
  align-items: center;
`;

const ThemeWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0 10px;
  font-size: 14px;
  font-weight: 600;
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
  const [userData, setUserData] = useAtom(currentUserDataAtom);
  const [currentTheme, setCurrentTheme] = useAtom(selectedTheme);
  useEffect(() => {
    if (!data) return;
    updateUser();
  }, [data]);

  const updateUser = () => {
    if (!data) return;
    setUserData({
      username: data?.username?.username ?? "",
      email: data?.username?.email,
      userID: data?.username?.userId,
      image_path: data?.username?.image_path,
      role: data?.username?.role?.name,
    });
  };

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
          <Wrapper>
            <ThemeWrapper>
              Theme
              <Switch
                size="small"
                onClick={() =>
                  setCurrentTheme({
                    isDark: !currentTheme.isDark,
                  })
                }
              />
            </ThemeWrapper>
            <Dropdown menu={{ items }} placement="bottomRight" arrow>
              <Avatar
                size={{ xs: 24, sm: 32, md: 32, lg: 36, xl: 40, xxl: 54 }}
                src={userData?.image_path ? userData?.image_path : defaultIcon}
              />
            </Dropdown>
          </Wrapper>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            height: "calc(100vh - 112px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default HomeLayout;
