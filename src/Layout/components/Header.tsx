import React from "react";
import {
  EditOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Dropdown,
  Grid,
  Layout,
  Segmented,
  theme,
  type MenuProps,
} from "antd";
import { useLocation, useNavigate } from "react-router";
import styled from "styled-components";
import { useAtom } from "jotai";
import { selectedTheme } from "../.././store/themeAtom";
import { isApplePlatform } from "../../components/CommandPalette";

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
  min-width: 0;
  flex: 1;

  @media (max-width: 640px) {
    gap: 6px;
  }
`;
const ScreenTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 1024px) {
    font-size: 18px;
  }

  @media (max-width: 640px) {
    font-size: 15.5px;
  }
`;
const Wrapper = styled.div`
  display: flex;
  gap: 0px 12px;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 640px) {
    gap: 0px 8px;
  }
`;
const CommandTrigger = styled.button<{ $isDark: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 10px 0 12px;
  border-radius: 10px;
  border: 1px solid
    ${(p) => (p.$isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(0, 0, 0, 0.1)")};
  background: ${(p) =>
    p.$isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.035)"};
  color: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 140ms ease, border-color 140ms ease;

  &:hover {
    background: ${(p) =>
      p.$isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)"};
  }

  .cmd-label {
    opacity: 0.65;
  }

  @media (max-width: 720px) {
    padding: 0 9px;
    .cmd-label,
    .cmd-kbd {
      display: none;
    }
  }
`;
const ShortcutBadge = styled.kbd`
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  font-weight: 600;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  border-radius: 6px;
  border: 1px solid rgba(128, 128, 128, 0.25);
  background: rgba(128, 128, 128, 0.1);
  opacity: 0.8;
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
  onOpenCommandPalette: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  collapsed,
  setCollapsed,
  userData,
  logoutUser,
  onOpenCommandPalette,
}) => {
  const {
    token: { colorBorderSecondary, colorText },
  } = theme.useToken();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [currentTheme, setCurrentTheme] = useAtom(selectedTheme);
  const screens = Grid.useBreakpoint();
  const isMobile = screens.sm === false;

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
        height: isMobile ? 56 : 64,
        padding: isMobile ? "0 10px" : "0 15px",
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
        <CommandTrigger
          type="button"
          $isDark={currentTheme.isDark}
          onClick={onOpenCommandPalette}
          aria-label="Open command palette"
          title="Search or jump to command"
        >
          <SearchOutlined style={{ opacity: 0.65 }} />
          <span className="cmd-label">Quick search…</span>
          <ShortcutBadge className="cmd-kbd">
            {isApplePlatform() ? "⌘K" : "Ctrl K"}
          </ShortcutBadge>
        </CommandTrigger>
        <Segmented
          size={isMobile ? "small" : "middle"}
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
