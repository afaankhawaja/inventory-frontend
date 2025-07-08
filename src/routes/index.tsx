import { createBrowserRouter } from "react-router-dom";

import SignIn from "../SignIn"
import SignUp from "../SignUp"
import ProtectedRoute from "../utils/ProtectedRoute";
import HomeLayout from "../Layout/components/HomeLayout";
import Dashboard from "../Dashboard";
import Users from "../Users/index";
import InventoryList from "../InventoryList";

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
            path: "users",
            element: <Users />,
          },
          {
            path: "inventory-list",
            element: <InventoryList />,
          },
        ],
      },
    ],
  },
]);

export default router;
