import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { ConfigProvider } from "antd";
import { customTheme } from "./theme/theme";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./apollo";
import { darkTheme } from "./theme/darkTheme";
import { selectedTheme } from "./store/themeAtom";
import { useAtom } from "jotai";

function App() {
  const [theme] = useAtom(selectedTheme)
  return (
    <ConfigProvider theme={theme.isDark ? darkTheme : customTheme}>
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </ConfigProvider>
  );
}

export default App;
