import React from "react";
import { Card, Skeleton } from "antd";
import { animate, motion } from "framer-motion";
import styled from "styled-components";

const Grid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 15px;

  @media (max-width: 1024px) {
    gap: 12px;
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
`;

const Label = styled.div`
  font-size: 13px;
  font-weight: 500;
  opacity: 0.65;
  margin-bottom: 8px;

  @media (max-width: 640px) {
    font-size: 11.5px;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
`;

const Value = styled.div`
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;

  @media (max-width: 1024px) {
    font-size: 23px;
  }

  @media (max-width: 640px) {
    font-size: 18px;
  }
`;

const BadgePill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.$color};
  white-space: nowrap;

  @media (max-width: 640px) {
    font-size: 10.5px;
  }
`;

const CountUp: React.FC<{
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}> = ({ value, decimals = 0, prefix = "", suffix = "" }) => {
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
            }) +
            suffix;
      },
    });
    return () => controls.stop();
  }, [value, decimals, prefix, suffix]);
  return (
    <span ref={ref}>
      {prefix + (0).toFixed(decimals) + suffix}
    </span>
  );
};

export interface PageStatItem {
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  badgeText?: string;
  badgeColor?: string;
}

interface PageStatsCardsProps {
  stats: PageStatItem[];
  loading?: boolean;
}

const PageStatsCards: React.FC<PageStatsCardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <Grid>
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} styles={{ body: { padding: 20 } }}>
            <Skeleton active paragraph={{ rows: 1 }} title={{ width: "45%" }} />
          </Card>
        ))}
      </Grid>
    );
  }

  return (
    <Grid>
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.04 }}
        >
          <Card styles={{ body: { padding: 20 } }}>
            <Label>{s.label}</Label>
            <ValueRow>
              <Value>
                <CountUp
                  value={s.value}
                  decimals={s.decimals}
                  prefix={s.prefix}
                  suffix={s.suffix}
                />
              </Value>
              {s.badgeText && (
                <BadgePill $color={s.badgeColor || "#007AFF"}>
                  {s.badgeText}
                </BadgePill>
              )}
            </ValueRow>
          </Card>
        </motion.div>
      ))}
    </Grid>
  );
};

export default PageStatsCards;
