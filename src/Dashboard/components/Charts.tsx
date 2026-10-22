import React, { useMemo } from "react";
import { Card, Empty, Skeleton, theme } from "antd";
import { useQuery } from "@apollo/client";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import dayjs from "dayjs";
import { GET_ALL_PURCHASE_HISTORY, GET_TRANSACTIONS } from "../graphql/queries";
import { useAtomValue } from "jotai";
import { selectedTheme } from "../../store/themeAtom";
import { palette } from "../../theme/tokens";

const useChartColors = () => {
  const { isDark } = useAtomValue(selectedTheme);
  const p = isDark ? palette.dark : palette.light;
  return {
    accent: p.accent,
    gray: isDark ? "#636366" : "#C7C7CC",
    grid: p.hairline,
    text: p.textSecondary,
    tooltipBg: p.card,
  };
};

interface Tx {
  transaction_type: string;
  quantity: number;
  transaction_date: string;
}
interface Purchase {
  purchase_date: string;
  total_cost: number;
}

const ChartCard: React.FC<{
  title: string;
  loading: boolean;
  empty: boolean;
  children: React.ReactNode;
}> = ({ title, loading, empty, children }) => (
  <Card title={title} styles={{ header: { border: "none", fontWeight: 600 } }}>
    <div style={{ height: 240 }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} title={false} />
      ) : empty ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data yet" />
      ) : (
        children
      )}
    </div>
  </Card>
);

export const TransactionsChart: React.FC = () => {
  const c = useChartColors();
  const { token } = theme.useToken();
  const { data, loading } = useQuery(GET_TRANSACTIONS, {
    variables: { skip: 0, take: 200 },
  });

  const chartData = useMemo(() => {
    const txs: Tx[] = data?.transactionsWithItems?.transactions ?? [];
    const days = Array.from({ length: 7 }, (_, i) =>
      dayjs().subtract(6 - i, "day"),
    );
    return days.map((d) => {
      const same = txs.filter((t) => dayjs(t.transaction_date).isSame(d, "day"));
      const sumBy = (type: string) =>
        same
          .filter((t) => t.transaction_type === type)
          .reduce((a, t) => a + (t.quantity || 0), 0);
      return {
        day: d.format("ddd"),
        "Check in": sumBy("CHECK_IN"),
        "Check out": sumBy("CHECK_OUT"),
      };
    });
  }, [data]);

  const empty = chartData.every((d) => d["Check in"] + d["Check out"] === 0);

  return (
    <ChartCard title="Check-in vs check-out · 7 days" loading={loading} empty={empty}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: c.text, fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} width={32} tick={{ fill: c.text, fontSize: 12 }} />
          <Tooltip
            cursor={{ fill: c.grid }}
            contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.grid}`, borderRadius: 12, color: token.colorText }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Check in" fill={c.accent} radius={[6, 6, 0, 0]} animationDuration={600} />
          <Bar dataKey="Check out" fill={c.gray} radius={[6, 6, 0, 0]} animationDuration={600} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export const PurchaseSpendChart: React.FC = () => {
  const c = useChartColors();
  const { token } = theme.useToken();
  const { data, loading } = useQuery(GET_ALL_PURCHASE_HISTORY, {
    variables: { skip: 0, take: 200 },
  });

  const chartData = useMemo(() => {
    const purchases: Purchase[] = data?.purchaseHistories?.purchases ?? [];
    const months = Array.from({ length: 6 }, (_, i) =>
      dayjs().subtract(5 - i, "month"),
    );
    return months.map((m) => ({
      month: m.format("MMM"),
      Spend: purchases
        .filter((p) => dayjs(p.purchase_date).isSame(m, "month"))
        .reduce((a, p) => a + (p.total_cost || 0), 0),
    }));
  }, [data]);

  const empty = chartData.every((d) => d.Spend === 0);

  return (
    <ChartCard title="Purchase spend · 6 months" loading={loading} empty={empty}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid vertical={false} stroke={c.grid} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: c.text, fontSize: 12 }} />
          <YAxis axisLine={false} tickLine={false} width={48} tick={{ fill: c.text, fontSize: 12 }} />
          <Tooltip
            formatter={(v) => `$${Number(v).toLocaleString()}`}
            contentStyle={{ background: c.tooltipBg, border: `1px solid ${c.grid}`, borderRadius: 12, color: token.colorText }}
          />
          {/* Solid, flat fill at low opacity — no gradient */}
          <Area
            type="monotone"
            dataKey="Spend"
            stroke={c.accent}
            strokeWidth={2}
            fill={c.accent}
            fillOpacity={0.12}
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
