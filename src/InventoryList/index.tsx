import { useMutation, useQuery } from "@apollo/client";
import { FETCH_ALL_ITEMS } from "./graphql/queries";
import ItemsTable from "./components/ItemsTable";
import styled from "styled-components";
import { Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import CreateNewItem from "./components/CreateNewItem";
import { DELETE_ITEM } from "./graphql/mutations";
import DeleteItem from "./components/DeleteItem";
import UpdateItem from "./components/UpdateItem";

const UsersContainer = styled.section`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const Title = styled.h1`
  font-size: 24px;
  color: #1890ff;
  padding-bottom: 20px;
  border-bottom: 1px solid lightgray;
`;

const AddNewItem = styled(Button)`
  font-size: 16px;
`;
const Wrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: end;
  margin-bottom: 20px;
`;

const TableWrapper = styled.div`
  flex: 1;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

const Index = () => {
  const [open, setOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [updateModal, setUpdateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const { data, loading, error } = useQuery(FETCH_ALL_ITEMS, {
    variables: {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    },
  });
  const [removeItem] = useMutation(DELETE_ITEM);

  const handleEditItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setUpdateModal(true);
  };
  const handleDeleteItem = (itemId: string) => {
    setSelectedItemId(itemId);
    setDeleteModal(true);
  };
  const deleteItem = () => {
    removeItem({
      variables: {
        itemID: selectedItemId,
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
      <Title>Items</Title>
      <Wrapper>
        <AddNewItem onClick={() => setOpen(true)}>
          Add new Item <PlusOutlined />{" "}
        </AddNewItem>
      </Wrapper>

      {error ? (
        <>{error.message}</>
      ) : (
        <>
          {loading ? (
            <div>loading inventory...</div>
          ) : (
            <TableWrapper>
              <ItemsTable
                dataSource={data?.items.items || []}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: data?.items.total,
                  onChange: (page, pageSize) => {
                    setPagination({ ...pagination, current: page, pageSize });
                  },
                }}
                onEditItem={handleEditItemClick}
                onDeleteItem={handleDeleteItem}
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
            Create New Item
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
        <CreateNewItem setOpen={setOpen} />
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
            Update Item
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
        <UpdateItem
          selectedItemId={selectedItemId}
          setUpdateModal={setUpdateModal}
        />
      </Modal>
      <Modal
        onOk={deleteItem}
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
        <DeleteItem />
      </Modal>
    </UsersContainer>
  );
};

export default Index;
