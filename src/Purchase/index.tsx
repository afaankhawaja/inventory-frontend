import styled from "styled-components";
import PurchaseHistoryTable from "./components/PurchaseHistoryTable";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const Heading = styled.h1``;
const TableWrapper = styled.div`
  flex: 1;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;
const Index = () => {
  return (
    <Section>
      <Heading>Purchase History</Heading>

      <TableWrapper>
        <PurchaseHistoryTable />
      </TableWrapper>
    </Section>
  );
};

export default Index;
