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
} from "antd";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { UPDATE_USER } from "../graphql/mutations";
import { RollbackOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { currentUserDataAtom } from "../../store/atoms";
import { useAtom } from "jotai";

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

const StyledForm = styled(Form<FieldType>)`
  width: 60%;
  
  padding:10px 20px;
  border-radius:20px;

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
const Wrapper = styled.section`
  width: 100%;
  display: flex;
  margin: auto auto;
  justify-content: start;
  justify-items: start;
  gap: 50px 50px;
`;
const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 10px 30px;
`;
const UserNameTitle = styled.div`
  font-size: 20px;
  font-weight: bold;
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

  if (loading) return <p>Loading user data...</p>;
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
        alert("updated user sucessfully");
        navigate("/");
      })
      .catch((error) => {
        alert(error.message);
        console.log("error", error);
      });
  };
  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (
    errorInfo,
  ) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Wrapper>
      <UserSection>
        <Avatar size={74} src={base64Url} />
        <UserNameTitle>{username} </UserNameTitle>
      </UserSection>
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
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item<FieldType> label="Phone" name="phone">
              <Input placeholder="your identity" />
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
          </Col>
          <Col span={8}>
            <Form.Item<FieldType> label="Active" name="is_active">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={50}>
          <Col span={12}>
            <Form.Item<FieldType> label="Cnic" name="cnic">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item<FieldType> label="Update Picture" name="image">
          <Upload
            accept="image/*"
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
          >
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
        </Form.Item>
        <Row style={{ justifyContent: "end" }} gutter={12}>
          <Col>
            <Form.Item>
              <Button variant="outlined" htmlType="submit">
                {!updateLoading ? "save" : "saving..."}
              </Button>
            </Form.Item>
          </Col>
          <Col>
            <Button
              color="pink"
              variant="outlined"
              onClick={() => {
                navigate("/");
              }}
            >
              back <RollbackOutlined />
            </Button>
          </Col>
        </Row>
      </StyledForm>
    </Wrapper>
  );
};

export default UpdateUser;
