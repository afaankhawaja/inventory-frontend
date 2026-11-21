import { FETCH_USER_BY_ID } from "../graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import {
  Form,
  Input,
  Switch,
  InputNumber,
  Button,
  type FormProps,
  Avatar,
  type UploadFile,
  Upload,
  Card,
  Skeleton,
  Tag,
  message,
} from "antd";
import { useEffect, useMemo, useState } from "react";
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

const GAP = 15;

const Layout = styled(motion.section)`
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: ${GAP}px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

/* ---------- Profile card (left) ---------- */
const Banner = styled.div`
  height: 96px;
  background: linear-gradient(135deg, #2c2c2e 0%, #6e6e73 100%);
`;

const ProfileBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 ${GAP + 5}px ${GAP + 5}px;
  gap: ${GAP}px;
`;

const AvatarRing = styled.div`
  margin-top: -60px;
  padding: 4px;
  border-radius: 50%;
  background: var(--ant-color-bg-container, #fff);
`;

const Name = styled.div`
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
`;

const Email = styled.div`
  font-size: 13px;
  opacity: 0.6;
  margin-top: 4px;
  word-break: break-all;
`;

const MetaList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border-top: 1px solid rgba(128, 128, 128, 0.18);
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${GAP}px;
  padding: 12px 0;
  font-size: 13px;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(128, 128, 128, 0.12);
  }
  > span:first-child {
    opacity: 0.6;
  }
  > span:last-child {
    font-weight: 500;
  }
`;

/* ---------- Form card (right) ---------- */
const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${GAP}px;
  &:not(:first-child) {
    margin-top: ${GAP + 10}px;
    padding-top: ${GAP + 10}px;
    border-top: 1px solid rgba(128, 128, 128, 0.18);
  }
`;

const SectionTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
`;

const SectionHint = styled.div`
  font-size: 12px;
  opacity: 0.55;
  margin-top: 2px;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${GAP}px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StyledForm = styled(Form<FieldType>)`
  .ant-form-item {
    margin-bottom: 0;
  }
  .ant-form-item-label {
    padding-bottom: 6px;
  }
  .ant-form-item-label > label {
    font-size: 13px;
    font-weight: 500;
  }
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: ${GAP}px;
  margin-top: ${GAP + 10}px;
  padding-top: ${GAP + 5}px;
  border-top: 1px solid rgba(128, 128, 128, 0.18);
`;

const SaveButton = styled(Button)`
  width: auto !important;
  min-width: 96px;
  border: none;
  box-shadow: none;
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
  const isActive = Form.useWatch("is_active", form);

  const previewUrl = useMemo(() => {
    const file = fileList[0]?.originFileObj;
    return file ? URL.createObjectURL(file) : undefined;
  }, [fileList]);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const avatarSrc =
    previewUrl ??
    (currentUser?.image_path
      ? currentUser.image_path
      : "../../../assets/images/user.png");
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
      <Layout>
        <Card>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </Card>
        <Card>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </Layout>
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

  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || username;

  return (
    <Layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Profile card */}
      <Card styles={{ body: { padding: 0 } }} style={{ overflow: "hidden" }}>
        <Banner />
        <ProfileBody>
          <AvatarRing>
            <Avatar size={112} src={avatarSrc} />
          </AvatarRing>

          <div>
            <Name>{fullName}</Name>
            <Email>{user.email}</Email>
            <div style={{ marginTop: 10 }}>
              <Tag
                color={isActive ? "green" : "red"}
                style={{ margin: 0, borderRadius: 20, padding: "0 10px" }}
              >
                {isActive ? "Active" : "Inactive"}
              </Tag>
            </div>
          </div>

          <Upload
            accept="image/*"
            beforeUpload={() => false}
            fileList={fileList}
            maxCount={1}
            showUploadList={false}
            onChange={({ fileList }) => setFileList(fileList)}
          >
            <Button icon={<UploadOutlined />}>Change photo</Button>
          </Upload>

          <MetaList>
            <MetaRow>
              <span>Username</span>
              <span>{user.username || "—"}</span>
            </MetaRow>
            <MetaRow>
              <span>Age</span>
              <span>{user.age ?? "—"}</span>
            </MetaRow>
            <MetaRow>
              <span>Phone</span>
              <span>{user.phone || "—"}</span>
            </MetaRow>
          </MetaList>
        </ProfileBody>
      </Card>

      {/* Form card */}
      <Card styles={{ body: { padding: GAP + 10 } }}>
        <StyledForm
          form={form}
          name="updateUser"
          layout="vertical"
          requiredMark={false}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <FormSection>
            <div>
              <SectionTitle>Account</SectionTitle>
              <SectionHint>Your sign-in details and status</SectionHint>
            </div>
            <FieldGrid>
              <Form.Item<FieldType>
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
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
                label="Account active"
                name="is_active"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </FieldGrid>
          </FormSection>

          <FormSection>
            <div>
              <SectionTitle>Personal information</SectionTitle>
              <SectionHint>Basic details about you</SectionHint>
            </div>
            <FieldGrid>
              <Form.Item<FieldType> label="First name" name="firstName">
                <Input placeholder="First name" />
              </Form.Item>
              <Form.Item<FieldType> label="Last name" name="lastName">
                <Input placeholder="Last name" />
              </Form.Item>
              <Form.Item<FieldType>
                label="Age"
                name="age"
                rules={[{ required: true, message: "Required" }]}
              >
                <InputNumber placeholder="22" style={{ width: "100%" }} />
              </Form.Item>
              <Form.Item<FieldType> label="CNIC" name="cnic">
                <Input placeholder="Identity number" />
              </Form.Item>
            </FieldGrid>
          </FormSection>

          <FormSection>
            <div>
              <SectionTitle>Contact</SectionTitle>
              <SectionHint>How we can reach you</SectionHint>
            </div>
            <FieldGrid>
              <Form.Item<FieldType> label="Phone" name="phone">
                <Input placeholder="Phone number" />
              </Form.Item>
            </FieldGrid>
          </FormSection>

          <ActionBar>
            <Button onClick={() => navigate("/")}>Cancel</Button>
            <SaveButton
              type="primary"
              htmlType="submit"
              loading={updateLoading}
            >
              Save
            </SaveButton>
          </ActionBar>
        </StyledForm>
      </Card>
    </Layout>
  );
};

export default UpdateUser;
