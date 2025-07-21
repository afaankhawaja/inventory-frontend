import UpdateUser from "./components/UpdateUserForm";
import { currentUserDataAtom } from "../store/atoms";
import { useAtom } from "jotai";

const Index = () => {
  const [userData] = useAtom(currentUserDataAtom);
  return <UpdateUser selectedUserId={userData.userID} />;
};

export default Index;
