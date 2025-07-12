import { createBrowserRouter } from "react-router-dom";

import SignIn from "../SignIn";
import SignUp from "../SignUp";
import ProtectedRoute from "../utils/ProtectedRoute";
import HomeLayout from "../Layout/components/HomeLayout";
import Dashboard from "../Dashboard";
import Users from "../Users/index";
import InventoryList from "../InventoryList";
import EditUserDetails from "../EditUserDetails";
import RoleProtectedRoute from "../utils/RoleProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <HomeLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: "inventory-list",
            element: <InventoryList />,
          },
          {
            path: "edit-user-details",
            element: <EditUserDetails />,
          },
          {
            element: (
              <RoleProtectedRoute allowedRoles={["admin", "super-admin"]} />
            ),
            children: [
              {
                path: "users",
                element: <Users />,
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
