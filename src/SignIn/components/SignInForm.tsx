import React, { useState } from "react";
import type { FormProps } from "antd";
import {
  Alert,
  App as AntdApp,
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Space,
  Tag,
  Typography,
} from "antd";
import { CopyOutlined, KeyOutlined, LoginOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SignInIcon from "../../../assets/svgs/sign_in_icon.svg?react";
import { SIGNIN_MUTATION } from "../graphql/mutations";
import { useMutation } from "@apollo/client";
import { broadcastLogin } from "../../utils/authBroadcast";
import AuthShell, { authLinkStyle } from "../../components/AuthShell";
import { copyToClipboard } from "../../utils/barcode";

interface DemoAccount {
  name: string;
  role: string;
  roleColor: string;
  username: string;
  email: string;
  password: string;
  permissions: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: "Arthur Pendleton",
    role: "super-admin",
    roleColor: "purple",
    username: "arthur.pendleton",
    email: "arthur@aurelia-vault.com",
    password: "Demo@1234",
    permissions: "Full access: Users, Restock, Delete, Check-in/out, Reports",
  },
  {
    name: "Elena Rostova",
    role: "admin",
    roleColor: "blue",
    username: "elena.rostova",
    email: "elena.gemologist@aurelia-vault.com",
    password: "Demo@1234",
    permissions: "Operations Manager: Edit items, Check-in/out, Maintenance, Users",
  },
  {
    name: "Tariq Al-Mansoor",
    role: "vault-custodian",
    roleColor: "green",
    username: "tariq.almansoor",
    email: "tariq.VIP@aurelia-vault.com",
    password: "Demo@1234",
    permissions: "Custodian view: Catalog, Barcode Scan, Reports (no Admin/Users)",
  },
];

type FieldType = {
  username?: string;
  password?: string;
  remember?: boolean;
};

const SignInForm: React.FC = () => {
  const [form] = Form.useForm();
  const [authError, setAuthError] = useState<string | null>(null);
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const navigate = useNavigate();
  const { message, notification } = AntdApp.useApp();

  const [signIn, { loading }] = useMutation(SIGNIN_MUTATION, {
    onCompleted: (data) => {
      if (data?.signin) {
        setAuthError(null);
        broadcastLogin();
        notification.success({
          message: "Signed in",
          description: "Welcome back to your inventory workspace.",
        });
        navigate("/");
      } else {
        setAuthError("Invalid username or password. Please try again.");
      }
    },
    onError: (error) => {
      setAuthError(error.message || "Sign in failed. Please try again.");
    },
  });

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setAuthError(null);
    try {
      await signIn({
        variables: {
          username: values.username,
          password: values.password,
        },
      });
    } catch (e) {
      console.error("Sign-in error caught in onFinish:", e);
    }
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <AuthShell
      icon={<SignInIcon style={{ width: 42, height: 42 }} />}
      title="Welcome to Inventory"
      subtitle="Manage your stock, sales, and optimize operations with ease."
      footer={
        <>
          Don't have an account yet?{" "}
          <button style={authLinkStyle} onClick={() => navigate("/signup")}>
            Sign up
          </button>
        </>
      }
    >
      <Form
        form={form}
        name="signin"
        layout="vertical"
        size="large"
        requiredMark={false}
        initialValues={{ remember: true }}
        onValuesChange={() => {
          if (authError) setAuthError(null);
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        {authError && (
          <Alert
            type="error"
            showIcon
            closable
            message="Sign in failed"
            description={authError}
            onClose={() => setAuthError(null)}
            style={{ marginBottom: 16, borderRadius: 10 }}
          />
        )}
        <Form.Item<FieldType>
          label="Username"
          name="username"
          rules={[{ required: true, message: "Please input your username!" }]}
        >
          <Input placeholder="Enter your username" autoComplete="username" />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
          style={{ marginBottom: 12 }}
        >
          <Input.Password
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </Form.Item>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            fontSize: 14,
          }}
        >
          <Form.Item<FieldType>
            name="remember"
            valuePropName="checked"
            style={{ margin: 0 }}
          >
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <button
            type="button"
            style={authLinkStyle}
            onClick={() =>
              message.info("Please contact an administrator to reset your password.")
            }
          >
            Forgot password?
          </button>
        </div>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign In
          </Button>
        </Form.Item>

        <motion.div
          animate={{ scale: [1, 1.015, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          style={{ marginBottom: 8 }}
        >
          <Button
            type="dashed"
            block
            icon={<KeyOutlined />}
            onClick={() => setDemoModalOpen(true)}
            style={{ borderRadius: 10, fontSize: 13 }}
          >
            Test Login · View Demo Accounts
          </Button>
        </motion.div>
      </Form>

      <Modal
        open={demoModalOpen}
        onCancel={() => setDemoModalOpen(false)}
        footer={null}
        centered
        width="min(520px, 94vw)"
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
            <KeyOutlined />
            <span>Demo Accounts for Testing</span>
          </div>
        }
      >
        <Space direction="vertical" size={12} style={{ width: "100%", paddingTop: 6 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12.5 }}>
            Select an account below to explore Role-Based Access Control (RBAC), or copy its credentials. Sign in uses <strong>Username</strong> + <strong>Password</strong>.
          </Typography.Text>

          {DEMO_ACCOUNTS.map((acc) => (
            <div
              key={acc.username}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(128, 128, 128, 0.2)",
                background: "rgba(128, 128, 128, 0.04)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <Space size={8}>
                  <Typography.Text strong>{acc.name}</Typography.Text>
                  <Tag color={acc.roleColor} style={{ margin: 0 }}>
                    {acc.role}
                  </Tag>
                </Space>
                <Space size={6}>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={async () => {
                      const ok = await copyToClipboard(
                        `Username: ${acc.username}\nPassword: ${acc.password}`,
                      );
                      if (ok) message.success(`Copied ${acc.username} credentials`);
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    size="small"
                    type="primary"
                    icon={<LoginOutlined />}
                    loading={loading}
                    onClick={async () => {
                      setAuthError(null);
                      form.setFieldsValue({
                        username: acc.username,
                        password: acc.password,
                      });
                      setDemoModalOpen(false);
                      try {
                        await signIn({
                          variables: {
                            username: acc.username,
                            password: acc.password,
                          },
                        });
                      } catch {
                        // Handled by onError
                      }
                    }}
                  >
                    Use & Sign In
                  </Button>
                </Space>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "4px 12px",
                  fontSize: 12,
                }}
              >
                <span>
                  <Typography.Text type="secondary">Username: </Typography.Text>
                  <code>{acc.username}</code>
                </span>
                <span>
                  <Typography.Text type="secondary">Password: </Typography.Text>
                  <code>{acc.password}</code>
                </span>
                <span style={{ gridColumn: "1 / -1" }}>
                  <Typography.Text type="secondary">Email: </Typography.Text>
                  <code>{acc.email}</code>
                </span>
              </div>

              <Typography.Text type="secondary" style={{ fontSize: 11.5 }}>
                {acc.permissions}
              </Typography.Text>
            </div>
          ))}
        </Space>
      </Modal>
    </AuthShell>
  );
};

export default SignInForm;
