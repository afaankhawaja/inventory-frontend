import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { ConfigProvider } from "antd";
import { customTheme } from "./theme/theme";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./apollo";
import { darkTheme } from "./theme/darkTheme";
import { selectedTheme } from "./store/themeAtom";
import { useAtom, useSetAtom } from "jotai";
import { currentUserDataAtom } from "./store/atoms";
import { subscribeToAuthBroadcast } from "./utils/authBroadcast";

function App() {
  const [theme] = useAtom(selectedTheme);
  const setUserData = useSetAtom(currentUserDataAtom);

  useEffect(() => {
    const unsubscribe = subscribeToAuthBroadcast(async (message) => {
      if (message.type === "LOGOUT") {
        try {
          await apolloClient.clearStore();
        } catch (error) {
          console.error("Error clearing Apollo store on multi-tab logout:", error);
        }
        setUserData({
          username: "",
          email: "",
          userID: "",
          image_path: "",
          role: "",
        });
        if (
          window.location.pathname !== "/signin" &&
          window.location.pathname !== "/signup"
        ) {
          try {
            router.navigate("/signin", { replace: true });
          } catch {
            window.location.href = "/signin";
          }
        }
      } else if (message.type === "LOGIN") {
        if (
          window.location.pathname === "/signin" ||
          window.location.pathname === "/signup"
        ) {
          try {
            await apolloClient.clearStore();
          } catch (error) {
            console.error("Error clearing Apollo store on multi-tab login:", error);
          }
          try {
            router.navigate("/", { replace: true });
          } catch {
            window.location.href = "/";
          }
        } else {
          try {
            await apolloClient.resetStore();
          } catch (error) {
            console.error("Error resetting Apollo store on multi-tab login:", error);
          }
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setUserData]);

  return (
    <ConfigProvider theme={theme.isDark ? darkTheme : customTheme}>
      <ApolloProvider client={apolloClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </ConfigProvider>
  );
}

export default App;
