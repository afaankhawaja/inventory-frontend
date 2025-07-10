import { atom } from "jotai";
interface UserData {
  username: string;
  email: string;
  userID: string;
  image_path: string;
}
export const currentUserDataAtom = atom<UserData>({
  username: "",
  email: "",
  image_path: "",
  userID: "",
});
