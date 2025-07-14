import styled from "styled-components";
import UserTable from "./components/UserTable";
import { FETCH_ALL_USERS } from "./graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { UserAddOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import { useState } from "react";
import CreateNewUser from "./components/CreateNewUser";
import UpdateUser from "./components/UpdateUser";
import DeleteUser from "./components/DeleteUser";
import { DELETE_USER } from "./graphql/mutations";
import { currentUserDataAtom } from "../store/atoms";
import { useAtom } from "jotai";

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
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const { data, loading, error } = useQuery(FETCH_ALL_USERS, {
    variables: {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    },
  });
  const [removeUser] = useMutation(DELETE_USER);
  const [currentUser] = useAtom(currentUserDataAtom);
  const userRole = currentUser?.role;

  const handleEditUserClick = (userID: string) => {
    setSelectedUserId(userID);
    setUpdateModal(true);
  };
  const handleDeleteUser = (userID: string) => {
    setSelectedUserId(userID);
    setDeleteModal(true);
  };

  const deleteUser = () => {
    removeUser({
      variables: {
        userID: selectedUserId,
      },
    })
      .then(() => {
        alert("sucessfully deleted");
        setDeleteModal(false);
      })
      .catch((error) => {
        alert(error?.message);
      });
  };
  return (
    <UsersContainer>
      <Title>Users</Title>
      <Wrapper>
        {userRole ? (
          (userRole === "admin" || userRole === "super-admin") && (
            <AddNewUser onClick={() => setOpen(true)}>
              Add new user <UserAddOutlined />{" "}
            </AddNewUser>
          )
        ) : (
          <></>
        )}
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
                dataSource={data?.users.users}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: data?.users.total,
                  onChange: (page, pageSize) => {
                    setPagination({
                      ...pagination,
                      current: page,
                      pageSize,
                    });
                  },
                }}
                onEditUser={handleEditUserClick}
                onDeleteUser={handleDeleteUser}
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
        <UpdateUser
          selectedUserId={selectedUserId}
          setUpdateModal={setUpdateModal}
        />
      </Modal>
      <Modal
        onOk={deleteUser}
        okText="Delete"
        okButtonProps={{
          style: {
            backgroundColor: "#FF4D4F",
            borderColor: "#FF4D4F",
          },
        }}
        centered
        open={deleteModal}
        onCancel={() => setDeleteModal(false)}
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
        <DeleteUser />
      </Modal>
    </UsersContainer>
  );
};

export default Index;
