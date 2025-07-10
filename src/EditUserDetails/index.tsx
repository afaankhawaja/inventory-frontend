import React from "react";
import UpdateUser from "./components/UpdateUserForm";
import { currentUserDataAtom } from "../store/atoms";
import { useAtom } from "jotai";

const Index = () => {
  const [userData] = useAtom(currentUserDataAtom);
  return (
    <div>
      <UpdateUser selectedUserId={userData.userID} />
    </div>
  );
};

export default Index;
