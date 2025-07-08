import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { ConfigProvider } from "antd";
import { customTheme } from "./theme/theme";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./apollo";

function App() {
  return (
    <ConfigProvider theme={customTheme}>
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </ConfigProvider>
  );
}

export default App;
