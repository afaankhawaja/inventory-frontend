
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { ConfigProvider } from "antd";
import { customTheme } from "./theme/theme";

function App() {
  return(
  <ConfigProvider theme={customTheme}>
    <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App;
