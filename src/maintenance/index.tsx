import styled from "styled-components";
import MaintenanceSchedulesTable from "./components/MaintenanceSchedulesTable";

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
  scrollbar-width: none;
  -ms-overflow-style: none;
`;
const Index = () => {
  return (
    <Section>
      <Heading>Maintenance Schedules</Heading>

      <TableWrapper>
        <MaintenanceSchedulesTable />
      </TableWrapper>
    </Section>
  );
};

export default Index;
