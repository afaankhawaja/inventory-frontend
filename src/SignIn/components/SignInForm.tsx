import React from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import SignInIcon from "../../../assets/svgs/sign_in_icon.svg?react";
import { SIGNIN_MUTATION } from "../graphql/mutations";
import { useMutation } from "@apollo/client";
import { broadcastLogin } from "../../utils/authBroadcast";
import AuthShell, { authLinkStyle } from "../../components/AuthShell";

type FieldType = {
  username?: string;
  password?: string;
  remember?: boolean;
};

const SignInForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [signIn, { loading }] = useMutation(SIGNIN_MUTATION, {
    onCompleted: (data) => {
      if (data?.signin) {
        broadcastLogin();
        message.success("Signed in");
        navigate("/");
      }
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
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
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
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

        <Form.Item style={{ marginBottom: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign In
          </Button>
        </Form.Item>
      </Form>
    </AuthShell>
  );
};

export default SignInForm;
