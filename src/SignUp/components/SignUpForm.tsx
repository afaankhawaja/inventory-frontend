import React, { useState } from "react";
import type { FormProps } from "antd";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Upload,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import SignUpIcon from "../../../assets/svgs/sign_up_user.svg?react";
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "../graphql/mutations";
import { UploadOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import AuthShell, { authLinkStyle } from "../../components/AuthShell";
import { palette } from "../../theme/tokens";

type FieldType = {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  image?: File;
  email?: string;
  cnic?: string;
};

/** Flat strength meter: 0-4 segments, no gradient. */
const strengthOf = (pw: string) => {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const strengthColors = [
  "#8e8e93",
  palette.status.critical,
  palette.status.warning,
  palette.light.accent,
  palette.status.success,
];
const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

const SignUpForm: React.FC = () => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [CreateUser, { loading }] = useMutation(CREATE_USER);
  const [form] = Form.useForm();

  const strength = strengthOf(password);

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    let base64: string | undefined;
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj as File;
      base64 = await getBase64(file);
    }
    CreateUser({
      variables: {
        username: values.username,
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password_hash: values.password,
        cnic: values.cnic,
        age: values.age,
        image_path: base64,
      },
    })
      .then(() => {
        form.resetFields();
        message.success("Account created");
        navigate("/");
      })
      .catch((error) => {
        message.error(error.message);
        console.error(error);
      });
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <AuthShell
      maxWidth={520}
      icon={<SignUpIcon style={{ width: 42, height: 42 }} />}
      title="Create your account"
      subtitle="Manage your stock, sales, and optimize operations with ease."
      footer={
        <>
          Already have an account?{" "}
          <button style={authLinkStyle} onClick={() => navigate("/")}>
            Sign in
          </button>
        </>
      }
    >
      <Form
        form={form}
        name="signup"
        layout="vertical"
        size="large"
        requiredMark={false}
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

        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item<FieldType> label="First name" name="firstName">
              <Input placeholder="First name" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item<FieldType> label="Last name" name="lastName">
              <Input placeholder="Last name" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={12}>
          <Col xs={24} sm={8}>
            <Form.Item<FieldType>
              label="Age"
              name="age"
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber placeholder="22" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={16}>
            <Form.Item<FieldType> label="CNIC" name="cnic">
              <Input placeholder="Your identity number" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item<FieldType>
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Enter your email!" },
            { type: "email", message: "The input is not a valid email!" },
          ]}
        >
          <Input placeholder="jeff@mail.com" autoComplete="email" />
        </Form.Item>

        <Form.Item<FieldType>
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
          style={{ marginBottom: 8 }}
        >
          <Input.Password
            placeholder="Enter your password"
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        {password && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 20,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  background:
                    i <= strength
                      ? strengthColors[strength]
                      : "rgba(128,128,128,0.25)",
                  transition: "background 200ms ease",
                }}
              />
            ))}
            <span
              style={{
                fontSize: 12,
                width: 48,
                textAlign: "right",
                color: strengthColors[strength],
              }}
            >
              {strengthLabels[strength]}
            </span>
          </div>
        )}

        <Form.Item<FieldType> label="Profile picture" name="image">
          <Upload
            accept="image/*"
            beforeUpload={() => false}
            fileList={fileList}
            maxCount={1}
            onChange={({ fileList }) => setFileList(fileList)}
          >
            <Button icon={<UploadOutlined />}>Select image</Button>
          </Upload>
        </Form.Item>

        <Form.Item style={{ marginBottom: 16 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Sign up
          </Button>
        </Form.Item>
      </Form>
    </AuthShell>
  );
};

export default SignUpForm;
