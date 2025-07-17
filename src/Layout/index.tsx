import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import { useNavigate } from "react-router";
import CurrentUser from ".././utils/CurrentUser";
import { useQuery } from "@apollo/client";
import { FETCH_USER_BY_USERNAME } from "./graphql/queries";
import { currentUserDataAtom } from ".././store/atoms";
import { useAtom } from "jotai";
import Sidebar from "./components/Sidebar";
import HeaderComponent from "./components/Header";
import ContentComponent from "./components/Content";

const HomeLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const username = CurrentUser();
  const { data } = useQuery(FETCH_USER_BY_USERNAME, {
    variables: { username: username },
  });
  const [userData, setUserData] = useAtom(currentUserDataAtom);

  useEffect(() => {
    if (!data) return;
    updateUser();
  }, [data]);

  const updateUser = () => {
    if (!data) return;
    setUserData({
      username: data?.username?.username ?? "",
      email: data?.username?.email,
      userID: data?.username?.userId,
      image_path: data?.username?.image_path,
      role: data?.username?.role?.name,
    });
  };

  const logoutUser = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/signin");
  };

  return (
    <Layout>
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
