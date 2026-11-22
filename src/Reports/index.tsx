import React, { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { Button, Card, Empty, Skeleton, Table, Tabs, Tag, theme, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined } from "@ant-design/icons";
import styled from "styled-components";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAtomValue } from "jotai";
import { FETCH_ALL_ITEMS } from "../InventoryList/graphql/queries";
import { FETCH_ALL_PURCHASES } from "../Purchase/graphql/queries";
import { GET_MAINTENANCE_SCHEDULES } from "../maintenance/graphql/queries";
import PageStatsCards, { type PageStatItem } from "../components/PageStatsCards";
import { selectedTheme } from "../store/themeAtom";
import { palette } from "../theme/tokens";

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

interface ItemRow {
  itemId: string;
  name: string;
  brand?: string;
  price?: number;
  condition?: string;
  quantity_in_stock?: number;
  reorder_threshold?: number;
  category?: { name?: string };
}

interface PurchaseRow {
  quantity?: number;
  total_cost?: string | number;
  vendor?: { name?: string };
}

interface MaintenanceRow {
  status?: string;
}

interface CategorySummaryRow {
  category: string;
  skuCount: number;
  totalUnits: number;
  lowStockCount: number;
  valuation: number;
  sharePct: number;
}

interface ReorderRow {
  itemId: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  threshold: number;
  deficit: number;
  estRestockCost: number;
}

interface VendorSummaryRow {
  vendor: string;
  orders: number;
  units: number;
  totalSpend: number;
  avgOrder: number;
}

const formatCurrency = (val: number) =>
  `$${val.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escapeCell = (cell: string | number) => {
    const str = String(cell ?? "");
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [headers.map(escapeCell).join(","), ...rows.map((r) => r.map(escapeCell).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  message.success(`Exported ${filename}`);
}

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState("valuation");
  const { isDark } = useAtomValue(selectedTheme);
  const { token } = theme.useToken();
  const p = isDark ? palette.dark : palette.light;

  const { data: itemsData, loading: itemsLoading } = useQuery(FETCH_ALL_ITEMS, {
    variables: { skip: 0, take: 500 },
  });
  const { data: purchasesData, loading: purchasesLoading } = useQuery(FETCH_ALL_PURCHASES, {
    variables: { skip: 0, take: 500 },
  });
  const { data: maintData, loading: maintLoading } = useQuery(GET_MAINTENANCE_SCHEDULES, {
    variables: { skip: 0, take: 500 },
  });

  const allItems: ItemRow[] = itemsData?.items?.items || [];
  const allPurchases: PurchaseRow[] = purchasesData?.purchaseHistories?.purchases || [];
  const allMaint: MaintenanceRow[] = maintData?.maintenanceSchedules?.maintenanceSchedules || [];

  const totalValuation = useMemo(
    () =>
      allItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.quantity_in_stock || 0),
        0,
      ),
    [allItems],
  );

  const totalSpend = useMemo(
    () => allPurchases.reduce((sum, pur) => sum + Number(pur.total_cost || 0), 0),
    [allPurchases],
  );

  const reorderRows: ReorderRow[] = useMemo(() => {
    return allItems
      .filter(
        (i) =>
          i.quantity_in_stock !== undefined &&
          i.reorder_threshold !== undefined &&
          Number(i.quantity_in_stock) <= Number(i.reorder_threshold),
      )
      .map((i) => {
        const stock = Number(i.quantity_in_stock || 0);
        const threshold = Number(i.reorder_threshold || 0);
        const deficit = Math.max(threshold - stock, 0);
        return {
          itemId: i.itemId,
          name: i.name,
          brand: i.brand || "—",
          category: i.category?.name || "Uncategorized",
          stock,
          threshold,
          deficit,
          estRestockCost: deficit * Number(i.price || 0),
        };
      })
      .sort((a, b) => a.stock - b.stock);
  }, [allItems]);

  const dueMaintenanceCount = useMemo(
    () => allMaint.filter((m) => m.status === "DUE").length,
    [allMaint],
  );

  const stats: PageStatItem[] = useMemo(
    () => [
      {
        label: "Total Vault Valuation",
        value: totalValuation,
        decimals: 2,
        prefix: "$",
        badgeText: `${allItems.length} SKUs`,
        badgeColor: palette.light.accent,
      },
      {
        label: "Total Procurement Spend",
        value: totalSpend,
        decimals: 2,
        prefix: "$",
        badgeText: `${allPurchases.length} Orders`,
        badgeColor: palette.status.success,
      },
      {
        label: "Reorder Risk SKUs",
        value: reorderRows.length,
        badgeText: reorderRows.length > 0 ? "Needs Restock" : "Optimal",
        badgeColor: reorderRows.length > 0 ? palette.status.warning : palette.status.success,
      },
      {
        label: "Due Maintenance",
        value: dueMaintenanceCount,
        badgeText: dueMaintenanceCount > 0 ? "Action Needed" : "On Schedule",
        badgeColor: dueMaintenanceCount > 0 ? palette.status.critical : palette.status.success,
      },
    ],
    [totalValuation, allItems.length, totalSpend, allPurchases.length, reorderRows.length, dueMaintenanceCount],
  );

  const categorySummary: CategorySummaryRow[] = useMemo(() => {
    const map = new Map<string, Omit<CategorySummaryRow, "sharePct">>();
    allItems.forEach((item) => {
      const cat = item.category?.name || "Uncategorized";
      const existing = map.get(cat) || {
        category: cat,
        skuCount: 0,
        totalUnits: 0,
        lowStockCount: 0,
        valuation: 0,
      };
      const qty = Number(item.quantity_in_stock || 0);
      const val = Number(item.price || 0) * qty;
      const isLow =
        item.reorder_threshold !== undefined && qty <= Number(item.reorder_threshold);

      existing.skuCount += 1;
      existing.totalUnits += qty;
      existing.lowStockCount += isLow ? 1 : 0;
      existing.valuation += val;
      map.set(cat, existing);
    });

    return Array.from(map.values())
      .map((row) => ({
        ...row,
        sharePct: totalValuation > 0 ? (row.valuation / totalValuation) * 100 : 0,
      }))
      .sort((a, b) => b.valuation - a.valuation);
  }, [allItems, totalValuation]);

  const conditionChartData = useMemo(() => {
    const counts: Record<string, number> = { NEW: 0, IN_USE: 0, DAMAGED: 0 };
    allItems.forEach((item) => {
      const key = item.condition || "NEW";
      counts[key] = (counts[key] || 0) + 1;
    });
    return [
      { name: "New", value: counts.NEW || 0, color: palette.status.success },
      { name: "In Use", value: counts.IN_USE || 0, color: p.accent },
      { name: "Damaged", value: counts.DAMAGED || 0, color: palette.status.critical },
    ].filter((d) => d.value > 0);
  }, [allItems, p.accent]);

  const vendorSummary: VendorSummaryRow[] = useMemo(() => {
    const map = new Map<string, { orders: number; units: number; totalSpend: number }>();
    allPurchases.forEach((pur) => {
      const vName = pur.vendor?.name || "Unknown Vendor";
      const entry = map.get(vName) || { orders: 0, units: 0, totalSpend: 0 };
      entry.orders += 1;
      entry.units += Number(pur.quantity || 0);
      entry.totalSpend += Number(pur.total_cost || 0);
      map.set(vName, entry);
    });
    return Array.from(map.entries())
      .map(([vendor, statsRow]) => ({
        vendor,
        ...statsRow,
        avgOrder: statsRow.orders > 0 ? statsRow.totalSpend / statsRow.orders : 0,
      }))
      .sort((a, b) => b.totalSpend - a.totalSpend);
  }, [allPurchases]);

  const handleExportCsv = () => {
    const dateStamp = new Date().toISOString().slice(0, 10);
    if (activeTab === "valuation") {
      downloadCsv(
        `inventory-valuation-${dateStamp}.csv`,
        ["Category", "SKUs", "Total Units", "Low Stock SKUs", "Valuation ($)", "Vault Share (%)"],
        categorySummary.map((r) => [
          r.category,
          r.skuCount,
          r.totalUnits,
          r.lowStockCount,
          r.valuation.toFixed(2),
          r.sharePct.toFixed(1),
        ]),
      );
    } else if (activeTab === "reorder") {
      downloadCsv(
        `reorder-action-list-${dateStamp}.csv`,
        ["Item", "Brand", "Category", "In Stock", "Reorder Threshold", "Deficit", "Est. Restock Cost ($)"],
        reorderRows.map((r) => [
          r.name,
          r.brand,
          r.category,
          r.stock,
          r.threshold,
          r.deficit,
          r.estRestockCost.toFixed(2),
        ]),
      );
    } else {
      downloadCsv(
        `vendor-spend-${dateStamp}.csv`,
        ["Vendor", "Orders", "Units Acquired", "Total Spend ($)", "Average Order Value ($)"],
        vendorSummary.map((r) => [
          r.vendor,
          r.orders,
          r.units,
          r.totalSpend.toFixed(2),
          r.avgOrder.toFixed(2),
        ]),
      );
    }
  };

  const categoryColumns: ColumnsType<CategorySummaryRow> = [
    { title: "Category", dataIndex: "category", key: "category", sorter: (a, b) => a.category.localeCompare(b.category) },
    { title: "SKUs", dataIndex: "skuCount", key: "skuCount", align: "center", sorter: (a, b) => a.skuCount - b.skuCount },
    { title: "Total Units", dataIndex: "totalUnits", key: "totalUnits", align: "center", sorter: (a, b) => a.totalUnits - b.totalUnits },
    {
      title: "Low Stock",
      dataIndex: "lowStockCount",
      key: "lowStockCount",
      align: "center",
      sorter: (a, b) => a.lowStockCount - b.lowStockCount,
      render: (val: number) =>
        val > 0 ? <Tag color="warning">{val} at risk</Tag> : <Tag color="success">Optimal</Tag>,
    },
    {
      title: "Total Valuation",
      dataIndex: "valuation",
      key: "valuation",
      align: "right",
      sorter: (a, b) => a.valuation - b.valuation,
      render: (val: number) => <strong>{formatCurrency(val)}</strong>,
    },
    {
      title: "Vault Share",
      dataIndex: "sharePct",
      key: "sharePct",
      align: "right",
      sorter: (a, b) => a.sharePct - b.sharePct,
      render: (val: number) => `${val.toFixed(1)}%`,
    },
  ];

  const reorderColumns: ColumnsType<ReorderRow> = [
    { title: "Item", dataIndex: "name", key: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: "Brand", dataIndex: "brand", key: "brand" },
    { title: "Category", dataIndex: "category", key: "category" },
    {
      title: "In Stock",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      sorter: (a, b) => a.stock - b.stock,
      render: (val: number) => (
        <Tag color={val === 0 ? "error" : "warning"}>{val === 0 ? "0 (Out)" : val}</Tag>
      ),
    },
    { title: "Threshold", dataIndex: "threshold", key: "threshold", align: "center" },
    {
      title: "Deficit",
      dataIndex: "deficit",
      key: "deficit",
      align: "center",
      sorter: (a, b) => a.deficit - b.deficit,
      render: (val: number) => (val > 0 ? `-${val}` : "0"),
    },
    {
      title: "Est. Restock Cost",
      dataIndex: "estRestockCost",
      key: "estRestockCost",
      align: "right",
      sorter: (a, b) => a.estRestockCost - b.estRestockCost,
      render: (val: number) => <strong>{formatCurrency(val)}</strong>,
    },
  ];

  const vendorColumns: ColumnsType<VendorSummaryRow> = [
    { title: "Vendor", dataIndex: "vendor", key: "vendor", sorter: (a, b) => a.vendor.localeCompare(b.vendor) },
    { title: "Orders", dataIndex: "orders", key: "orders", align: "center", sorter: (a, b) => a.orders - b.orders },
    { title: "Units Acquired", dataIndex: "units", key: "units", align: "center", sorter: (a, b) => a.units - b.units },
    {
      title: "Avg Order Value",
      dataIndex: "avgOrder",
      key: "avgOrder",
      align: "right",
      sorter: (a, b) => a.avgOrder - b.avgOrder,
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "Total Spend",
      dataIndex: "totalSpend",
      key: "totalSpend",
      align: "right",
      sorter: (a, b) => a.totalSpend - b.totalSpend,
      render: (val: number) => <strong>{formatCurrency(val)}</strong>,
    },
  ];

  return (
    <Container>
      <PageStatsCards stats={stats} loading={itemsLoading || purchasesLoading || maintLoading} />

      <TwoCol>
        <Card title="Valuation by category (Top 6)" styles={{ header: { border: "none", fontWeight: 600 } }}>
          <div style={{ height: 240 }}>
            {itemsLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} title={false} />
            ) : categorySummary.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No inventory data" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySummary.slice(0, 6)}>
                  <CartesianGrid vertical={false} stroke={p.hairline} />
                  <XAxis
                    dataKey="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: p.textSecondary, fontSize: 11 }}
                    tickFormatter={(v: string) => (v.length > 14 ? `${v.slice(0, 12)}…` : v)}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={54}
                    tick={{ fill: p.textSecondary, fontSize: 11 }}
                    tickFormatter={(v: number) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  />
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v))}
                    cursor={{ fill: p.hairline }}
                    contentStyle={{
                      background: p.card,
                      border: `1px solid ${p.hairline}`,
                      borderRadius: 12,
                      color: token.colorText,
                    }}
                  />
                  <Bar dataKey="valuation" name="Valuation" fill={p.accent} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="Asset condition breakdown" styles={{ header: { border: "none", fontWeight: 600 } }}>
          <div style={{ height: 240 }}>
            {itemsLoading ? (
              <Skeleton active paragraph={{ rows: 6 }} title={false} />
            ) : conditionChartData.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No inventory data" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conditionChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={3}
                  >
                    {conditionChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: p.card,
                      border: `1px solid ${p.hairline}`,
                      borderRadius: 12,
                      color: token.colorText,
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </TwoCol>

      <Card styles={{ body: { paddingTop: 4 } }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          tabBarExtraContent={
            <Button icon={<DownloadOutlined />} onClick={handleExportCsv}>
              Export CSV
            </Button>
          }
          items={[
            {
              key: "valuation",
              label: "Category valuation",
              children: (
                <Table<CategorySummaryRow>
                  rowKey="category"
                  loading={itemsLoading}
                  columns={categoryColumns}
                  dataSource={categorySummary}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 640 }}
                />
              ),
            },
            {
              key: "reorder",
              label: `Reorder action (${reorderRows.length})`,
              children: (
                <Table<ReorderRow>
                  rowKey="itemId"
                  loading={itemsLoading}
                  columns={reorderColumns}
                  dataSource={reorderRows}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 720 }}
                />
              ),
            },
            {
              key: "vendors",
              label: "Vendor spend",
              children: (
                <Table<VendorSummaryRow>
                  rowKey="vendor"
                  loading={purchasesLoading}
                  columns={vendorColumns}
                  dataSource={vendorSummary}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 640 }}
                />
              ),
            },
          ]}
        />
      </Card>
    </Container>
  );
};

export default Reports;
