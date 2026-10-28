import React from "react";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Skeleton, theme } from "antd";
import { useQuery } from "@apollo/client";
import { animate, motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  FETCH_ALL_ITEMS,
  FETCH_ITEMS_BY_TODAY,
  FETCH_ITEMS_BY_YESTERDAY,
} from "../graphql/queries";
import styled from "styled-components";
import { palette } from "../../theme/tokens";

interface ItemLite {
  price: number;
  quantity_in_stock: number;
  is_high_value: boolean;
}

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
`;

const Label = styled.div`
  font-size: 13px;
  font-weight: 500;
  opacity: 0.65;
  margin-bottom: 8px;
`;

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
`;

const Value = styled.div`
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

const Delta = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  color: ${(p) => p.$color};
  background: ${(p) => p.$color}1f;
`;

const CountUp: React.FC<{ value: number; decimals?: number; prefix?: string }> = ({
  value,
  decimals = 0,
  prefix = "",
}) => {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current)
          ref.current.textContent =
            prefix +
            v.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals,
            });
      },
    });
    return () => controls.stop();
  }, [value, decimals, prefix]);
  return <span ref={ref}>{prefix + (0).toFixed(decimals)}</span>;
};

const sum = (list: ItemLite[] | undefined, fn: (i: ItemLite) => number) =>
  (list ?? []).reduce((acc, curr) => acc + fn(curr), 0);

interface StatProps {
  label: string;
  value: number;
  diff: number;
  decimals?: number;
  prefix?: string;
  to: string;
  index: number;
}

const StatCard: React.FC<StatProps> = ({
  label,
  value,
  diff,
  decimals,
  prefix,
  to,
  index,
}) => {
  const navigate = useNavigate();
  const color =
    diff > 0
      ? palette.status.success
      : diff < 0
        ? palette.status.critical
        : "#8e8e93";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        hoverable
        style={{ cursor: "pointer" }}
        onClick={() => navigate(to)}
        styles={{ body: { padding: 20 } }}
      >
        <Label>{label}</Label>
        <ValueRow>
          <Value>
            <CountUp value={value} decimals={decimals} prefix={prefix} />
          </Value>
          <Delta $color={color}>
            {diff > 0 ? (
              <ArrowUpOutlined />
            ) : diff < 0 ? (
              <ArrowDownOutlined />
            ) : null}
            {diff > 0 ? `+${diff}` : diff}
          </Delta>
        </ValueRow>
      </Card>
    </motion.div>
  );
};

const InventoryValuationCards: React.FC = () => {
  const { token } = theme.useToken();
  const { data, loading, error } = useQuery(FETCH_ALL_ITEMS);
  const { data: yesterdayData } = useQuery(FETCH_ITEMS_BY_YESTERDAY);
  const { data: todayData } = useQuery(FETCH_ITEMS_BY_TODAY);

  if (error) return <div style={{ color: token.colorError }}>{error.message}</div>;

  if (loading || !data?.items?.items) {
    return (
      <Grid>
        {[0, 1, 2, 3].map((i) => (
          <Card key={i}>
            <Skeleton active paragraph={{ rows: 1 }} title={{ width: "40%" }} />
          </Card>
        ))}
      </Grid>
    );
  }

  const items: ItemLite[] = data.items.items;
  const today: ItemLite[] | undefined = todayData?.todayItems;
  const yesterday: ItemLite[] | undefined = yesterdayData?.yesterdayItems;

  const value = (i: ItemLite) => i.price * i.quantity_in_stock;
  const stock = (i: ItemLite) => i.quantity_in_stock;
  const high = (i: ItemLite) => (i.is_high_value ? 1 : 0);

  const diff = (fn: (i: ItemLite) => number) =>
    sum(today, fn) - sum(yesterday, fn);

  const cards: Omit<StatProps, "index">[] = [
    {
      label: "Total Items",
      value: data.items.total ?? items.length,
      diff: (today?.length ?? 0) - (yesterday?.length ?? 0),
      to: "/inventory-list",
    },
    {
      label: "Inventory Value",
      value: sum(items, value),
      diff: Math.round(diff(value) * 100) / 100,
      decimals: 2,
      prefix: "$",
      to: "/inventory-list",
    },
    {
      label: "Total Inventory Stock",
      value: sum(items, stock),
      diff: diff(stock),
      to: "/inventory-list",
    },
    {
      label: "High Value Assets",
      value: sum(items, high),
      diff: diff(high),
      to: "/inventory-list",
    },
  ];

  return (
    <Grid>
      {cards.map((c, i) => (
        <StatCard key={c.label} index={i} {...c} />
      ))}
    </Grid>
  );
};

export default InventoryValuationCards;
