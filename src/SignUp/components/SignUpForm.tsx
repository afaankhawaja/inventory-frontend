import React from "react";
import type { FormProps } from "antd";
import { Button, Form, Input } from "antd";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import SignUpIcon from "../../../assets/svgs/sign_up_user.svg?react"

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
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e0e0e0;
  max-width: 500px;
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

const SignIn = styled.p`
  color: #1890ff;
  cursor: pointer;
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

  }
`;

type FieldType = {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  image?: string;
  email?: string;
};

const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
  console.log("Success:", values);
};

const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (errorInfo) => {
  console.log("Failed:", errorInfo);
};

const SignUpForm: React.FC = () => {
  const navigate = useNavigate();

  const navigateToSignIn = () => {
    navigate("/");
  };

  return (
    <PageWrapper>
      <FormContainer>
        <HeaderSection>
          <SignUpIcon style={{ width: "42", height: "42" }} />
          <WelcomeTitle>Welcome to Inventory</WelcomeTitle>
          <Subtitle>
            Manage your stock, sales, and optimize operations with ease.
          </Subtitle>
        </HeaderSection>

        <StyledForm
          name="basic"
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

          <Form.Item<FieldType> label="firstName" name="firstName">
            <Input placeholder="first name" />
          </Form.Item>

          <Form.Item<FieldType> label="lastName" name="lastName">
            <Input placeholder="last name" />
          </Form.Item>

          <Form.Item<FieldType> label="age" name="age">
            <Input placeholder="22 e.g." />
          </Form.Item>

          <Form.Item<FieldType>
            label="email"
            name="email"
            rules={[
              { required: true, message: " enter your email!" },
              {
                type: "email",
                message: "The input is not a valid email!",
              },
            ]}
          >
            <Input placeholder="jeff@mail.com" />
          </Form.Item>

          <Form.Item<FieldType>
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Sign up
            </Button>
          </Form.Item>
        </StyledForm>
        <BottomText>
          Already have an account?{" "}
          <SignIn onClick={navigateToSignIn}>Sign in</SignIn>
        </BottomText>
      </FormContainer>
    </PageWrapper>
  );
};

export default SignUpForm;
