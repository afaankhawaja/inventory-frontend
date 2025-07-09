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
} from "antd";
import { useEffect } from "react";
import styled from "styled-components";
import { UPDATE_USER } from "../graphql/mutations";

type FieldType = {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  age?: number;
  image?: string;
  email?: string;
  cnic?: string;
  role?: string;
  phone?: string;
  is_active?: boolean;
};

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

interface PropsType {
  selectedUserId: string;
  setUpdateModal: (state: boolean) => void;
}

const UpdateUser = ({ selectedUserId, setUpdateModal }: PropsType) => {
  const [form] = Form.useForm();
  const { data, loading, error } = useQuery(FETCH_USER_BY_ID, {
    variables: { userID: selectedUserId },
  });
  const [updateUser] = useMutation(UPDATE_USER);
  const user = data?.user;
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
        role: user.role?.name || "",
        password: user?.password_hash,
        cnic: user?.cnic,
      });
    }
  }, [user, form]);

  if (loading) return <p>Loading user data...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data || !data.user) return <p>No user found</p>;
  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
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
      },
    }).then(() => {
      form.resetFields();
      alert("updated user sucessfully");
      setUpdateModal(false);
    });
  };
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <StyledForm
        form={form}
        name="updateUser"
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

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item<FieldType> label="First Name" name="firstName">
              <Input placeholder="first name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item<FieldType> label="Last Name" name="lastName">
              <Input placeholder="last name" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item<FieldType> label="Phone" name="phone">
          <Input placeholder="your identity" />
        </Form.Item>

        <Row gutter={50}>
          <Col span={12}>
            <Form.Item<FieldType> label="Role" name="role">
              <Input placeholder="Admin etc." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<FieldType>
              label="Age"
              name="age"
              rules={[{ required: true }]}
            >
              <InputNumber placeholder="22 e.g." />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={50}>
          <Col span={12}>
            <Form.Item<FieldType> label="Cnic" name="cnic">
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<FieldType> label="Active" name="is_active">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item<FieldType>
          label="Email"
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

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {!loading ? "Update User" : "updating..."}
          </Button>
        </Form.Item>
      </StyledForm>
    </div>
  );
};

export default UpdateUser;
