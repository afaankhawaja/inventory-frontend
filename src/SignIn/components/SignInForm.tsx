import React from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input } from "antd";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import SignInIcon from "../../../assets/svgs/sign_in_icon.svg?react";
import { SIGNIN_MUTATION } from "../graphql/mutations";
import { useMutation } from "@apollo/client";

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f2f5 0%, #e0e5ec 100%);
  font-family: "Inter", sans-serif;
  padding: 20px;
  box-sizing: border-box;
  width: 100dvw;
`;

const FormContainer = styled.div`
  background-color: #ffffff;
  padding: 40px;
  border-radius: 15px;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
  max-width: 450px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding: 30px;
    max-width: 90%;
  }

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 30px;
  width: 100%;
`;

const WelcomeTitle = styled.h2`
  font-size: 1.8em;
  color: #333;
  margin-bottom: 10px;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.8em;
  }
`;

const Subtitle = styled.p`
  font-size: 0.8em;
  color: #666;
  line-height: 1.5;
  margin-bottom: 0;

  @media (max-width: 768px) {
    font-size: 1em;
  }
`;

const BottomText = styled.p`
  font-size: 0.8em;
  color: #666;
  line-height: 1.5;
  margin-bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;

  @media (max-width: 768px) {
    font-size: 1em;
  }
`;

const SignUP = styled.p`
  color: #1890ff;
  cursor: pointer;
`;

const PasswordReset = styled.div`
  width: full;
  text-align: end;
  color: #1890ff;
  cursor: pointer;
  font-size: 14px;
  margin-top: -10px;
`;

const StyledForm = styled(Form<FieldType>)`
  width: 100%;

  .ant-form-item-label > label {
    font-weight: 500;
  }

  .ant-btn-primary {
    width: 100%;
    border: none;
    box-shadow: 0 4px 15px #1890ff;
    transition: all 0.3s ease;
  }
`;

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
      if (data && data.signin) {
        localStorage.setItem("access_token", data.signin.access_token);
        localStorage.setItem("refresh_token", data.signin.refresh_token);
        alert("Login Successful!");
        navigate("/home");
      }
    },
    onError: (error) => {
      alert(error.message);
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

  const navigateToSignUp = () => {
    navigate("/signup");
  };

  return (
    <PageWrapper>
      <FormContainer>
        <HeaderSection>
          <SignInIcon style={{ width: "42", height: "42" }} />
          <WelcomeTitle>Welcome to Inventory</WelcomeTitle>
          <Subtitle>
            Manage your stock, sales, and optimize operations with ease.
          </Subtitle>
        </HeaderSection>

        <StyledForm
          form={form}
          name="signin"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <PasswordReset>Forgot password?</PasswordReset>

          <Form.Item<FieldType> name="remember" valuePropName="checked">
            <Checkbox>Remember me</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </StyledForm>
        <BottomText>
          Don't have an account yet?{" "}
          <SignUP onClick={navigateToSignUp}>Sign up</SignUP>
        </BottomText>
      </FormContainer>
    </PageWrapper>
  );
};

export default SignInForm;
