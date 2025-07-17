import styled from "styled-components";
import HighValueAssetTable from "./components/HighValueAssetTable";
import InventoryValuationCards from "./components/InventoryValuationCards";
import { useState } from "react";
import { GET_TRANSACTIONS } from "./graphql/queries";
import { useQuery } from "@apollo/client";
import AlertsTable from "./components/AlertsTable";

const Container = styled.section`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px 10px;
  padding: 0 10px;
  overflow: auto scroll;
`;
const Index = () => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });

  const { data, loading, error } = useQuery(GET_TRANSACTIONS, {
    variables: {
      skip: (pagination.current - 1) * pagination.pageSize,
      take: pagination.pageSize,
    },
  });

  const transaction = data?.transactionsWithItems?.transactions;
  const hightValueAssetTransaction = transaction?.filter(
    (fil: {
      transaction_type: string;
      transactionItems: { item: { is_high_value: boolean } }[];
    }) =>
      fil.transaction_type === "CHECK_OUT" &&
      fil.transactionItems[0]?.item?.is_high_value === true,
  );

  return (
    <Container>
      <InventoryValuationCards />

      {error ? (
        <>error {error.message}</>
      ) : loading ? (
        <>loading table data...</>
      ) : (
        <HighValueAssetTable
          dataSource={hightValueAssetTransaction}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: data?.items?.total,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      )}
      <AlertsTable
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: data?.items?.total,
          onChange: (page, pageSize) => {
            setPagination({ ...pagination, current: page, pageSize });
          },
        }}
      />
    </Container>
  );
};

export default Index;
