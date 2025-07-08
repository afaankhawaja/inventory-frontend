import { useQuery } from "@apollo/client";
import { FETCH_ALL_ITEMS } from "./graphql/queries";
import ItemsTable from "./components/ItemsTable";
import styled from "styled-components";
import { Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useState } from "react";
import CreateNewItem from "./components/CreateNewItem";

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
  const { data, loading, error } = useQuery(FETCH_ALL_ITEMS);
  return (
    <UsersContainer>
      <Title>Items</Title>
      <Wrapper>
        <AddNewUser onClick={() => setOpen(true)}>
          Add new Item <PlusOutlined />{" "}
        </AddNewUser>
      </Wrapper>

      {error ? (
        <>{error.message}</>
      ) : (
        <>
          {loading ? (
            <div>loading inventory...</div>
          ) : (
            <TableWrapper>
              <ItemsTable dataSource={data?.items} />
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
    </UsersContainer>
  );
};

export default Index;
