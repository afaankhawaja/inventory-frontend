import { Navigate, Outlet } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { FETCH_USER_BY_USERNAME } from "../Layout/graphql/queries";


const ProtectedRoute = () => {
  const { data, loading, error } = useQuery(FETCH_USER_BY_USERNAME, {
    fetchPolicy: "network-only",
  });
  if (loading && !data) return null;
  return data?.me && !error ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
