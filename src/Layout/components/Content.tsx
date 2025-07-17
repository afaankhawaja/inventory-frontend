import React from "react";
import { Layout, theme } from "antd";
import { Outlet } from "react-router";

const { Content } = Layout;

const ContentComponent: React.FC = () => {
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
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
  );
};

export default ContentComponent;
