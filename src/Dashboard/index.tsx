import styled from "styled-components";
import { Card, Skeleton, Tabs } from "antd";
import HighValueAssetTable from "./components/HighValueAssetTable";
import InventoryValuationCards from "./components/InventoryValuationCards";
import { useState } from "react";
import { GET_TRANSACTIONS } from "./graphql/queries";
import { useQuery } from "@apollo/client";
import AlertsTable from "./components/AlertsTable";
import PurchaseHistoryTable from "./components/PurchaseHistoryTable";
import { PurchaseSpendChart, TransactionsChart } from "./components/Charts";

const Container = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 15px;
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
      <AlertsTable />
      <InventoryValuationCards />

      <TwoCol>
        <TransactionsChart />
        <PurchaseSpendChart />
      </TwoCol>

      <Card styles={{ body: { paddingTop: 4 } }}>
        <Tabs
          items={[
            {
              key: "high",
              label: "High value check-outs",
              children: error ? (
                <>error {error.message}</>
              ) : loading ? (
                <Skeleton active />
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
              ),
            },
            {
              key: "purchases",
              label: "Recent purchases",
              children: <PurchaseHistoryTable />,
            },
          ]}
        />
      </Card>
    </Container>
  );
};

export default Index;
