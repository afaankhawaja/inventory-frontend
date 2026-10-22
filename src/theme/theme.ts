import { palette, fontFamily, sharedComponents } from "./tokens";

const p = palette.light;

export const customTheme = {
  token: {
    colorPrimary: p.accent,
    colorTextBase: p.text,
    colorTextSecondary: p.textSecondary,
    colorBgLayout: p.page,
    colorBgContainer: p.card,
    colorBorder: p.separator,
    colorBorderSecondary: p.hairline,
    colorSuccess: palette.status.success,
    colorWarning: palette.status.warning,
    colorError: palette.status.critical,
    colorInfo: p.accent,
    borderRadius: 10,
    borderRadiusLG: 16,
    fontSize: 14,
    fontFamily,
    boxShadow: "none",
    boxShadowSecondary: "0 8px 24px rgba(0, 0, 0, 0.08)",
  },
  components: {
    ...sharedComponents,
    Layout: {
      headerBg: "rgba(245, 245, 247, 0.8)",
      siderBg: p.card,
      bodyBg: p.page,
    },
    Menu: {
      ...sharedComponents.Menu,
      itemSelectedBg: p.sidebarActive,
      itemSelectedColor: p.accent,
    },
  },
};
