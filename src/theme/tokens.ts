export const palette = {
  light: {
    accent: "#007AFF",
    text: "#1D1D1F",
    textSecondary: "#6E6E73",
    separator: "#D2D2D7",
    page: "#F5F5F7",
    card: "#FFFFFF",
    sidebarActive: "rgba(0, 122, 255, 0.12)",
    hairline: "rgba(0, 0, 0, 0.08)",
  },
  dark: {
    accent: "#0A84FF",
    text: "#F5F5F7",
    textSecondary: "#98989D",
    separator: "#38383A",
    page: "#000000",
    card: "#1C1C1E",
    sidebarActive: "rgba(10, 132, 255, 0.2)",
    hairline: "rgba(255, 255, 255, 0.1)",
  },
  status: {
    critical: "#FF3B30",
    warning: "#FF9500",
    success: "#34C759",
  },
};

export const fontFamily =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", system-ui, "Segoe UI", sans-serif';

export const sharedComponents = {
  Input: { paddingBlock: 8, paddingInline: 14, controlHeight: 40 },
  InputNumber: { paddingBlock: 8, paddingInline: 14, controlHeight: 40 },
  Button: { controlHeight: 40, fontSize: 15, fontWeight: 500, primaryShadow: "none" },
  Card: { borderRadiusLG: 16 },
  Menu: { itemBorderRadius: 10, itemHeight: 40 },
};
