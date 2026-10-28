import styled from "styled-components";
import UserTable from "./components/UserTable";
import { FETCH_ALL_USERS } from "./graphql/queries";
import { useMutation, useQuery } from "@apollo/client";
import { UserAddOutlined } from "@ant-design/icons";
import { Button, Modal, message } from "antd";
import { useMemo, useState } from "react";
import CreateNewUser from "./components/CreateNewUser";
import UpdateUser from "./components/UpdateUser";
import DeleteUser from "./components/DeleteUser";
import { DELETE_USER } from "./graphql/mutations";
import { currentUserDataAtom } from "../store/atoms";
import { useAtom } from "jotai";
import PageStatsCards, { type PageStatItem } from "../components/PageStatsCards";
import { palette } from "../theme/tokens";

const UsersContainer = styled.section`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const HeaderRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;
const Title = styled.h1`
  font-size: 28px;
  margin: 0;
`;

const AddNewUser = styled(Button)`
  font-size: 15px;
`;

const TableWrapper = styled.div`
  overflow: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

interface UserRow {
  is_active?: boolean | null;
  role?: { name?: string } | null;
}

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
  const { data: allUsersData, loading: statsLoading } = useQuery(
    FETCH_ALL_USERS,
    {
      variables: { skip: 0, take: 500 },
    },
  );
  const [removeUser] = useMutation(DELETE_USER);
  const [currentUser] = useAtom(currentUserDataAtom);
  const userRole = currentUser?.role;

  const stats: PageStatItem[] = useMemo(() => {
    const users: UserRow[] = allUsersData?.users?.users || [];
    const totalCount = allUsersData?.users?.total ?? users.length;
    const activeCount = users.filter((u) => u.is_active === true).length;
    const adminCount = users.filter(
      (u) => u.role?.name === "admin" || u.role?.name === "super-admin",
    ).length;
    const uniqueRoles = new Set(users.map((u) => u.role?.name).filter(Boolean))
      .size;

    return [
      {
        label: "Total Registered Personnel",
        value: totalCount,
        badgeText: "Vault Access",
        badgeColor: palette.light.accent,
      },
      {
        label: "Active Accounts",
        value: activeCount,
        badgeText:
          totalCount > 0
            ? `${Math.round((activeCount / totalCount) * 100)}% Active`
            : "0%",
        badgeColor: palette.status.success,
      },
      {
        label: "Administrators & Directors",
        value: adminCount,
        badgeText: "Privileged",
        badgeColor: palette.status.warning,
      },
      {
        label: "Assigned Security Roles",
        value: uniqueRoles,
        badgeText: "RBAC Tiers",
        badgeColor: palette.light.accent,
      },
    ];
  }, [allUsersData]);

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
        message.success("sucessfully deleted");
        setDeleteModal(false);
      })
      .catch((error) => {
        message.error(error?.message);
      });
  };
  return (
    <UsersContainer>
      <HeaderRow>
        <Title>Users</Title>
        {userRole && (userRole === "admin" || userRole === "super-admin") && (
          <AddNewUser type="primary" onClick={() => setOpen(true)}>
            Add new user <UserAddOutlined />
          </AddNewUser>
        )}
      </HeaderRow>

      <PageStatsCards stats={stats} loading={statsLoading} />

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
              color: "inherit",
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
              color: "inherit",
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
