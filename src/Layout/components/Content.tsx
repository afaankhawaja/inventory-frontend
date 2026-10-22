import React from "react";
import { Layout } from "antd";
import { Outlet, useLocation } from "react-router";
import { motion } from "framer-motion";

const { Content } = Layout;

const ContentComponent: React.FC = () => {
  const location = useLocation();

  return (
    <Content
      style={{
        margin: "0 auto",
        padding: "24px",
        width: "100%",
        maxWidth: 1400,
        boxSizing: "border-box",
        overflow: "auto",
        height: "calc(100vh - 64px)",
      }}
    >
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ minHeight: "100%" }}
      >
        <Outlet />
      </motion.div>
    </Content>
  );
};

export default ContentComponent;
