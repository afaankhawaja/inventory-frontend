import { theme } from "antd";

const { darkAlgorithm } = theme;

export const darkTheme = {
  algorithm: darkAlgorithm,
  token: {
    colorPrimary: "#177ddc",
    borderRadius: 8,
    fontSize: 16,
    colorTextBase: "#ffffff",
    colorBgContainer: "#141414",
  },
  components: {
    Form: {},
    Input: {
      paddingBlock: 10,
      paddingInline: 15,
    },
    Button: {
      controlHeight: 45,
      fontSize: 18,
      fontWeight: 600,
    },
    InputNumber: {
      paddingBlock: 10,
      paddingInline: 15,
    },
    Layout: {
      headerBg: "#141414",
      siderBg: "#001529",
      bodyBg: "#000000",
    },
  },
};
