import React from "react";
import { theme } from "antd";
import { motion } from "framer-motion";

interface AuthShellProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  maxWidth?: number;
  children: React.ReactNode;
}

const AuthShell: React.FC<AuthShellProps> = ({
  icon,
  title,
  subtitle,
  footer,
  maxWidth = 440,
  children,
}) => {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        boxSizing: "border-box",
        padding: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: token.colorBgLayout,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          width: "100%",
          maxWidth,
          boxSizing: "border-box",
          padding: "36px 32px",
          borderRadius: 20,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {icon}
          <h2 style={{ fontSize: 26, margin: "12px 0 6px" }}>{title}</h2>
          {subtitle && (
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.5,
                color: token.colorTextSecondary,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {children}
        {footer && (
          <div
            style={{
              marginTop: 8,
              textAlign: "center",
              fontSize: 14,
              color: token.colorTextSecondary,
            }}
          >
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export const authLinkStyle: React.CSSProperties = {
  color: "#007aff",
  cursor: "pointer",
  fontWeight: 500,
  background: "none",
  border: "none",
  padding: 0,
  font: "inherit",
};

export default AuthShell;
