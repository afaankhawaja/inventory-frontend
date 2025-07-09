import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  type FormProps,
} from "antd";
import styled from "styled-components";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_USER_WITH_ROLE } from "../graphql/mutations";
import { FETCH_ALL_ROLES } from "../graphql/queries";

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

interface Props {
  setOpen: (arg: boolean) => void;
}
interface RoleProp {
  roleId?: string;
  name?: string;
}
const CreateNewUser = ({ setOpen }: Props) => {
  const [form] = Form.useForm();
  const [createUser, { loading }] = useMutation(CREATE_USER_WITH_ROLE);
  const { data: roleData } = useQuery(FETCH_ALL_ROLES);
  const menuItems = roleData?.roles.map((role: RoleProp) => ({
    value: role?.roleId,
    label: role?.name,
  }));

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
        is_active: true,
        phone: values.phone,
        roleId: values.role,
      },
    })
      .then(() => {
        form.resetFields();
        alert("created user sucessfully");
        setOpen(false);
      })
      .catch((error) => {
        console.log("error.message", error.message);
      });
  };
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
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

      <Form.Item<FieldType> label="Cnic" name="cnic">
        <Input placeholder="your identity" />
      </Form.Item>

      <Row gutter={50}>
        <Col span={12}>
          <Form.Item<FieldType> label="Role" name="role">
            <Select
              style={{ height: "44px" }}
              placeholder="Select a role"
              options={menuItems}
            />
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
      <Form.Item<FieldType> label="Phone" name="phone">
        <Input placeholder="+9230..." />
      </Form.Item>

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
