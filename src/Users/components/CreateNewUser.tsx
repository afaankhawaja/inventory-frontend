import { Button, Form, Input, InputNumber, type FormProps } from "antd";
import styled from "styled-components";
import { useMutation } from "@apollo/client";
import { CREATE_USER_WITH_ROLE } from "../graphql/queries";

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

interface Props {
  setOpen: (arg: boolean) => void;
}

const CreateNewUser = ({ setOpen }: Props) => {
  const [form] = Form.useForm();
  const [createUser, { data, loading }] = useMutation(CREATE_USER_WITH_ROLE);
  console.log("data", data);

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    createUser({
      variables: {
        username: values.username,
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        password_hash: values.password,
        cnic: values.cnic,
        age: values.age,
        role: values.role,
      },
    }).then(() => {
      form.resetFields();
      alert("created user sucessfully");
      setOpen(false);
    });
  };
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <StyledForm
      form={form}
      name="createUser"
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

      <Form.Item<FieldType> label="age" name="age" rules={[{ required: true }]}>
        <InputNumber placeholder="22 e.g." />
      </Form.Item>

      <Form.Item<FieldType> label="cnic" name="cnic">
        <Input placeholder="your identity" />
      </Form.Item>

      <Form.Item<FieldType> label="role" name="role">
        <Input placeholder="Admin etc." />
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
          {!loading ? "Create User" : "creating..."}
        </Button>
      </Form.Item>
    </StyledForm>
  );
};

export default CreateNewUser;
