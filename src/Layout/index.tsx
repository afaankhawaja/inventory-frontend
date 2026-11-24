import React, { useEffect, useState } from "react";
import { Grid, Layout } from "antd";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "@apollo/client";
import { apolloClient } from "../apollo";
import { FETCH_USER_BY_USERNAME, LOGOUT_MUTATION } from "./graphql/queries";
import { currentUserDataAtom } from ".././store/atoms";
import { useAtom } from "jotai";
import { broadcastLogout } from "../utils/authBroadcast";
import Sidebar from "./components/Sidebar";
import HeaderComponent from "./components/Header";
import ContentComponent from "./components/Content";
import CommandPalette from "../components/CommandPalette";

const HomeLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = screens.md === false;

  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen]);
  const navigate = useNavigate();
  const { data } = useQuery(FETCH_USER_BY_USERNAME);
  const [logout] = useMutation(LOGOUT_MUTATION);
  const [userData, setUserData] = useAtom(currentUserDataAtom);

  useEffect(() => {
    if (!data) return;
    updateUser();
  }, [data]);

  const updateUser = () => {
    if (!data) return;
    setUserData({
      username: data?.me?.username ?? "",
      email: data?.me?.email,
      userID: data?.me?.userId,
      image_path: data?.me?.image_path,
      role: data?.me?.role?.name,
    });
  };

  const logoutUser = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout mutation failed:", err);
    } finally {
      broadcastLogout();
      try {
        await apolloClient.clearStore();
      } catch (err) {
        console.error("Error clearing Apollo store:", err);
      }
      setUserData({
        username: "",
        email: "",
        userID: "",
        image_path: "",
        role: "",
      });
      navigate("/signin", { replace: true });
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
        return;
      }

      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName?.toLowerCase();
        const isEditable =
          tag === "input" ||
          tag === "textarea" ||
          tag === "select" ||
          target?.isContentEditable;
        if (!isEditable) {
          e.preventDefault();
          setCommandOpen(true);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", width: "100%" }}>
      <Sidebar
        collapsed={collapsed}
        logoutUser={logoutUser}
        isMobile={isMobile}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <Layout style={{ flex: 1, minWidth: 0 }}>
        <HeaderComponent
          collapsed={isMobile ? !mobileOpen : collapsed}
          setCollapsed={() =>
            isMobile ? setMobileOpen((prev) => !prev) : setCollapsed((prev) => !prev)
          }
          userData={userData}
          logoutUser={logoutUser}
          onOpenCommandPalette={() => setCommandOpen(true)}
        />
        <ContentComponent />
      </Layout>
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        userRole={userData?.role}
        onLogout={logoutUser}
      />
    </Layout>
  );
};

export default HomeLayout;
