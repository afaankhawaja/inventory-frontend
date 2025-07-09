import styled from "styled-components";
import UserTable from "./components/UserTable";
import { FETCH_ALL_USERS } from "./graphql/queries";
import { useQuery } from "@apollo/client";
import { UserAddOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useState } from "react";
import CreateNewUser from "./components/CreateNewUser";
import UpdateUser from "./components/UpdateUser";

const UsersContainer = styled.section`
  width: 100%;
  height: 100%;
`;
const Title = styled.h1`
  font-size: 24px;
  color: #1890ff;
  padding-bottom: 20px;
  border-bottom: 1px solid lightgray;
`;

const AddNewUser = styled(Button)`
  font-size: 16px;
`;
const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  margin-bottom: 20px;
`;

const TableWrapper = styled.div`
  overflow: scroll;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const Index = () => {
  const [open, setOpen] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const { data, loading, error } = useQuery(FETCH_ALL_USERS);

  const handleViewUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setUpdateModal(true);
  };
  return (
    <UsersContainer>
      <Title>Users</Title>
      <Wrapper>
        <AddNewUser onClick={() => setOpen(true)}>
          Add new user <UserAddOutlined />{" "}
        </AddNewUser>
      </Wrapper>

      {error ? (
        <>{error.message}</>
      ) : (
        <>
          {loading ? (
            <div>loading users...</div>
          ) : (
            <TableWrapper>
              <UserTable
                dataSource={data?.users}
                onViewUser={handleViewUserClick}
              />
            </TableWrapper>
          )}
        </>
      )}
      <Modal
        title={
          <div
            style={{
              textAlign: "center",
              color: "#1890ff",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            Create New User
          </div>
        }
        centered
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        height={"90%"}
      >
        <CreateNewUser setOpen={setOpen} />
      </Modal>
      <Modal
        title={
          <div
            style={{
              textAlign: "center",
              color: "#1890ff",
              fontWeight: "bold",
              fontSize: "20px",
            }}
          >
            Update User
          </div>
        }
        centered
        open={updateModal}
        footer={null}
        onCancel={() => setUpdateModal(false)}
        width={{
          xs: "90%",
          sm: "80%",
          md: "70%",
          lg: "60%",
          xl: "50%",
          xxl: "40%",
        }}
        height={"90%"}
      >
        <UpdateUser selectedUserId={selectedUserId} />
      </Modal>
    </UsersContainer>
  );
};

export default Index;
