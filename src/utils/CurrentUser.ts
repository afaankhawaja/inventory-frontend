import { jwtDecode } from "jwt-decode";

const CurrentUser = () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    try {
      const decodedUsername = jwtDecode(token);
      return decodedUsername?.username;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
  return null;
};

export default CurrentUser;
