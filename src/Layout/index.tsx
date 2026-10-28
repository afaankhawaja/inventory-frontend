import React, { useEffect, useState } from "react";
import { Layout } from "antd";
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

const HomeLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} logoutUser={logoutUser} />
      <Layout>
        <HeaderComponent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          userData={userData}
          logoutUser={logoutUser}
        />
        <ContentComponent />
      </Layout>
    </Layout>
  );
};

export default HomeLayout;
