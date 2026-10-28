import styled from "styled-components";
import PurchaseHistoryTable from "./components/PurchaseHistoryTable";
import { useQuery } from "@apollo/client";
import { FETCH_ALL_PURCHASES } from "./graphql/queries";
import { useMemo } from "react";
import PageStatsCards, { type PageStatItem } from "../components/PageStatsCards";
import { palette } from "../theme/tokens";

const Section = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
`;

const Heading = styled.h1`
  font-size: 28px;
  margin: 0 0 16px;
`;
const TableWrapper = styled.div`
  flex: 1;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

interface PurchaseItemRow {
  quantity?: number;
  total_cost?: string | number;
  vendor?: { name?: string };
}

const Index = () => {
  const { data, loading } = useQuery(FETCH_ALL_PURCHASES, {
    variables: { skip: 0, take: 500 },
  });

  const stats: PageStatItem[] = useMemo(() => {
    const purchases: PurchaseItemRow[] =
      data?.purchaseHistories?.purchases || [];
    const totalOrders = data?.purchaseHistories?.total ?? purchases.length;
    const totalSpend = purchases.reduce(
      (acc, p) => acc + Number(p.total_cost || 0),
      0,
    );
    const totalUnits = purchases.reduce(
      (acc, p) => acc + Number(p.quantity || 0),
      0,
    );
    const uniqueVendors = new Set(
      purchases.map((p) => p.vendor?.name).filter(Boolean),
    ).size;
    const avgOrderValue = totalOrders > 0 ? totalSpend / totalOrders : 0;

    return [
      {
        label: "Total Procurement Spend",
        value: totalSpend,
        decimals: 2,
        prefix: "$",
        badgeText: `${totalOrders} Orders`,
        badgeColor: palette.light.accent,
      },
      {
        label: "Average Order Value",
        value: avgOrderValue,
        decimals: 2,
        prefix: "$",
        badgeText: "Per Invoice",
        badgeColor: palette.status.success,
      },
      {
        label: "Total Units Acquired",
        value: totalUnits,
        badgeText: "Vault Additions",
        badgeColor: palette.light.accent,
      },
      {
        label: "Active Supplier Partners",
        value: uniqueVendors,
        badgeText: "Verified Vendors",
        badgeColor: palette.status.warning,
      },
    ];
  }, [data]);

  return (
    <Section>
      <Heading>Purchase History</Heading>

      <PageStatsCards stats={stats} loading={loading} />

      <TableWrapper>
        <PurchaseHistoryTable />
      </TableWrapper>
    </Section>
  );
};

export default Index;
