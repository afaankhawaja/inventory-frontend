import { theme } from "antd";
import { palette, fontFamily, sharedComponents } from "./tokens";

const { darkAlgorithm } = theme;
const p = palette.dark;

export const darkTheme = {
  algorithm: darkAlgorithm,
  token: {
    colorPrimary: p.accent,
    colorTextBase: p.text,
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
  },
  components: {
    ...sharedComponents,
    Layout: {
      headerBg: "rgba(28, 28, 30, 0.8)",
      siderBg: p.card,
      bodyBg: p.page,
    },
    Menu: {
      ...sharedComponents.Menu,
      itemSelectedBg: p.sidebarActive,
      itemSelectedColor: p.accent,
      darkItemSelectedBg: p.sidebarActive,
      darkItemBg: p.card,
    },
  },
};
