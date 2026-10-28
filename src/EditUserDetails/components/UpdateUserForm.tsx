import { FETCH_USER_BY_ID } from "../graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import {
  Form,
  Input,
  Switch,
  Row,
  Col,
  InputNumber,
  Button,
  type FormProps,
  Avatar,
  type UploadFile,
  Upload,
  Card,
  Skeleton,
  message,
} from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { UPDATE_USER } from "../graphql/mutations";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { currentUserDataAtom } from "../../store/atoms";
import { useAtom } from "jotai";
import { motion } from "framer-motion";

type FieldType = {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  image?: File;
  email?: string;
  cnic?: string;
  role?: string;
  phone?: string;
  is_active?: boolean;
};

const Wrapper = styled(motion.section)`
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserNameTitle = styled.div`
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Sub = styled.div`
  font-size: 13px;
  opacity: 0.6;
`;

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.6;
  margin: 0 0 8px 4px;
`;

const ActionBar = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 0;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
`;

interface PropsType {
  selectedUserId: string;
}

const UpdateUser = ({ selectedUserId }: PropsType) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const { data, loading, error } = useQuery(FETCH_USER_BY_ID, {
    variables: { userID: selectedUserId },
  });
  const [currentUser] = useAtom(currentUserDataAtom);
  const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER);
  const user = data?.user;
  const navigate = useNavigate();
  const base64Url =
    currentUser?.image_path !== null
      ? currentUser?.image_path
      : "../../../assets/images/user.png";
  const username = currentUser ? currentUser.username : "";

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        email: user.email,
        is_active: user.is_active ?? false,
        age: user.age,
        cnic: user?.cnic,
        image: user?.image_path,
      });
    }
  }, [user, form]);

  if (loading)
    return (
      <Wrapper>
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </Wrapper>
    );
  if (error) return <p>Error: {error.message}</p>;
  if (!data || !data.user) return <p>No user found</p>;
  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    let base64: string | undefined;
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj as File;
      base64 = await getBase64(file);
    } else {
      base64 = user?.image_path;
    }
    updateUser({
      variables: {
        userID: selectedUserId,
        username: values.username,
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        cnic: values.cnic,
        age: values.age,
        is_active: values.is_active,
        phone: values.phone,
        image_path: base64,
      },
    })
      .then(() => {
        form.resetFields();
        message.success("Profile updated");
        navigate("/");
      })
      .catch((error) => {
        message.error(error.message);
        console.log("error", error);
      });
  };
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Wrapper
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <UserSection>
        <Avatar size={72} src={base64Url} />
        <div>
          <UserNameTitle>{username}</UserNameTitle>
          <Sub>{user.email}</Sub>
        </div>
      </UserSection>

      <Form
        form={form}
        name="updateUser"
        layout="vertical"
        size="large"
        requiredMark={false}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <SectionLabel>Account</SectionLabel>
        <Card styles={{ body: { paddingBottom: 4 } }} style={{ marginBottom: 20 }}>
          <Form.Item<FieldType>
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>
          <Form.Item<FieldType>
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Enter your email!" },
              { type: "email", message: "The input is not a valid email!" },
            ]}
          >
            <Input placeholder="jeff@mail.com" />
          </Form.Item>
          <Form.Item<FieldType>
            label="Active"
            name="is_active"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Card>

        <SectionLabel>Personal</SectionLabel>
        <Card styles={{ body: { paddingBottom: 4 } }} style={{ marginBottom: 20 }}>
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
              <Form.Item<FieldType> label="Phone" name="phone">
                <Input placeholder="Phone number" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item<FieldType> label="CNIC" name="cnic">
            <Input placeholder="Identity number" />
          </Form.Item>
        </Card>

        <SectionLabel>Photo</SectionLabel>
        <Card style={{ marginBottom: 8 }}>
          <Form.Item<FieldType> name="image" style={{ marginBottom: 0 }}>
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
        </Card>

        <ActionBar>
          <Button onClick={() => navigate("/")}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={updateLoading}>
            Save changes
          </Button>
        </ActionBar>
      </Form>
    </Wrapper>
  );
};

export default UpdateUser;
