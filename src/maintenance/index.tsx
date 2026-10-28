import styled from "styled-components";
import MaintenanceSchedulesTable from "./components/MaintenanceSchedulesTable";
import { useQuery } from "@apollo/client";
import { GET_MAINTENANCE_SCHEDULES } from "./graphql/queries";
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
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

interface ScheduleRow {
  maintenance_type?: string;
  status?: string;
}

const Index = () => {
  const { data, loading } = useQuery(GET_MAINTENANCE_SCHEDULES, {
    variables: { skip: 0, take: 500 },
  });

  const stats: PageStatItem[] = useMemo(() => {
    const schedules: ScheduleRow[] =
      data?.maintenanceSchedules?.maintenanceSchedules || [];
    const totalCount =
      data?.maintenanceSchedules?.total ?? schedules.length;
    const dueCount = schedules.filter((s) => s.status === "DUE").length;
    const scheduledCount = schedules.filter(
      (s) => s.status === "SCHEDULED",
    ).length;
    const completedCount = schedules.filter(
      (s) => s.status === "COMPLETED",
    ).length;
    const correctiveCount = schedules.filter(
      (s) => s.maintenance_type === "CORRECTIVE",
    ).length;

    return [
      {
        label: "Total Service Records",
        value: totalCount,
        badgeText: `${correctiveCount} Corrective`,
        badgeColor: palette.light.accent,
      },
      {
        label: "Urgent / Due Now",
        value: dueCount,
        badgeText: dueCount > 0 ? "Needs Attention" : "All Clear",
        badgeColor:
          dueCount > 0 ? palette.status.critical : palette.status.success,
      },
      {
        label: "Scheduled Inspections",
        value: scheduledCount,
        badgeText: "Upcoming",
        badgeColor: palette.status.warning,
      },
      {
        label: "Completed Restorations",
        value: completedCount,
        badgeText:
          totalCount > 0
            ? `${Math.round((completedCount / totalCount) * 100)}% Resolved`
            : "0%",
        badgeColor: palette.status.success,
      },
    ];
  }, [data]);

  return (
    <Section>
      <Heading>Maintenance Schedules</Heading>

      <PageStatsCards stats={stats} loading={loading} />

      <TableWrapper>
        <MaintenanceSchedulesTable />
      </TableWrapper>
    </Section>
  );
};

export default Index;
