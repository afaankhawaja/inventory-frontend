import { Navigate, Outlet } from "react-router-dom";
import { useAtom } from "jotai";
import { currentUserDataAtom } from "../store/atoms";

interface RoleProps {
  allowedRoles: string[];
}
const RoleProtectedRoute = ({ allowedRoles }: RoleProps) => {
  const token = localStorage.getItem("access_token");
  const [currentUser] = useAtom(currentUserDataAtom);

  if (!token) return <Navigate to="/signin" replace />;
  if (currentUser?.role !== null && currentUser.role !== undefined)
  {
      if (allowedRoles.includes(currentUser?.role)) {
        return <Outlet />;
      }
  }

  return <Navigate to="/" replace />;
};

export default RoleProtectedRoute;
