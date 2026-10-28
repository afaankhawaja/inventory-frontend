import React, { useState } from "react";
import { Button, Card, Empty, Pagination, Skeleton, theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useQuery } from "@apollo/client";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import styled from "styled-components";
import { GET_ALL_ALERTS } from "../graphql/queries";
import { palette } from "../../theme/tokens";

dayjs.extend(relativeTime);

interface AlertRow {
  alertId: string | number;
  alert_type: string;
  alert_date: string;
  severity: string;
  message: string;
  itemAlerts?: { item?: { name?: string } }[];
}

const levelOf = (a: AlertRow): "critical" | "warning" | "info" => {
  const s = (a.severity ?? "").toLowerCase();
  const t = (a.alert_type ?? "").toLowerCase();
  if (["critical", "high", "urgent"].includes(s) || t === "expiry")
    return "critical";
  if (["warning", "medium"].includes(s) || t.includes("low")) return "warning";
  return "info";
};

const levelColor = {
  critical: palette.status.critical,
  warning: palette.status.warning,
  info: palette.light.accent,
};
const levelLabel = { critical: "Critical", warning: "Warning", info: "Info" };

const Banner = styled(motion.div)<{ $color: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  color: ${(p) => p.$color};
  background: ${(p) => p.$color}14;
`;

const Row = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 4px;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(128, 128, 128, 0.18);
  }
`;

const Dot = styled.span<{ $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${(p) => p.$color};
`;

const Body = styled.div`
  flex: 1;
  min-width: 0;
`;
const Title = styled.div`
  font-weight: 600;
  font-size: 14px;
`;
const Msg = styled.div`
  font-size: 13px;
  opacity: 0.65;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const Meta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  font-size: 12px;
  opacity: 0.8;
`;
const Pill = styled.span<{ $color: string }>`
  padding: 1px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: ${(p) => p.$color};
  background: ${(p) => p.$color}1f;
`;

const AlertsTable: React.FC = () => {
  const { token } = theme.useToken();
  const [page, setPage] = useState(1);
  const [dismissed, setDismissed] = useState(false);
  const pageSize = 5;

  const { loading, error, data } = useQuery(GET_ALL_ALERTS, {
    variables: { skip: (page - 1) * pageSize, take: pageSize },
    pollInterval: 60000,
    fetchPolicy: "network-only",
  });

  const alerts: AlertRow[] = data?.alerts?.alerts ?? [];
  const total: number = data?.alerts?.total ?? 0;
  const criticalCount = alerts.filter((a) => levelOf(a) === "critical").length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
      <AnimatePresence>
        {!dismissed && criticalCount > 0 && (
          <Banner
            $color={palette.status.critical}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <span>
              {criticalCount} critical alert{criticalCount > 1 ? "s" : ""} need
              your attention
            </span>
            <Button
              type="text"
              size="small"
              aria-label="Dismiss"
              icon={<CloseOutlined />}
              onClick={() => setDismissed(true)}
              style={{ color: palette.status.critical }}
            />
          </Banner>
        )}
      </AnimatePresence>

      <Card
        title={`Alerts${total ? ` · ${total}` : ""}`}
        styles={{ header: { border: "none", fontWeight: 600 } }}
      >
        {loading && !data ? (
          <Skeleton active paragraph={{ rows: 4 }} title={false} />
        ) : error ? (
          <div style={{ color: token.colorError }}>{error.message}</div>
        ) : alerts.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="All clear — no new alerts"
          />
        ) : (
          <>
            {alerts.map((a, i) => {
              const level = levelOf(a);
              const item = a.itemAlerts?.[0]?.item?.name;
              return (
                <Row
                  key={a.alertId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.25 }}
                >
                  <Dot $color={levelColor[level]} />
                  <Body>
                    <Title>
                      {item ?? (a.alert_type ?? "").replace("_", " ")}
                    </Title>
                    <Msg>{a.message}</Msg>
                  </Body>
                  <Meta>
                    <Pill $color={levelColor[level]}>{levelLabel[level]}</Pill>
                    <span>{dayjs(a.alert_date).fromNow()}</span>
                  </Meta>
                </Row>
              );
            })}
            {total > pageSize && (
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 12 }}>
                <Pagination
                  size="small"
                  current={page}
                  pageSize={pageSize}
                  total={total}
                  showSizeChanger={false}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default AlertsTable;
