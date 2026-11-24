import React from "react";
import { Grid, Layout } from "antd";
import { Outlet, useLocation } from "react-router";
import { motion } from "framer-motion";

const { Content } = Layout;

const ContentComponent: React.FC = () => {
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isMobile = screens.sm === false;

  return (
    <Content
      style={{
        margin: 0,
        padding: isMobile ? "10px" : "15px",
        width: "100%",
        flex: 1,
        minWidth: 0,
        boxSizing: "border-box",
        overflow: "auto",
        height: isMobile ? "calc(100vh - 56px)" : "calc(100vh - 64px)",
      }}
    >
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ minHeight: "100%", width: "100%" }}
      >
        <Outlet />
      </motion.div>
    </Content>
  );
};

export default ContentComponent;
