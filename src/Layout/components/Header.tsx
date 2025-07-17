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
  Switch,
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
    token: { colorBgContainer },
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
  );
};

export default HeaderComponent;
