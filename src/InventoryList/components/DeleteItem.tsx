import styled from "styled-components";
import { WarningOutlined } from "@ant-design/icons";

const Wrapper = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px 0px;
`;
const Text = styled.div`
  font-size: 18px;
`;
const DeleteItem = () => {
  return (
    <Wrapper>
      <Text>Are you sure !! do you want to delete this item ?</Text>{" "}
      <WarningOutlined style={{ color: "red", fontSize: "48px" }} />
    </Wrapper>
  );
};

export default DeleteItem;
