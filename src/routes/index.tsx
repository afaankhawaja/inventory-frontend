import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { Card, Skeleton } from "antd";

import ProtectedRoute from "../utils/ProtectedRoute";
import RoleProtectedRoute from "../utils/RoleProtectedRoute";
import Layout from "../Layout";

const SignIn = lazy(() => import("../SignIn"));
const SignUp = lazy(() => import("../SignUp"));
const Dashboard = lazy(() => import("../Dashboard"));
const Users = lazy(() => import("../Users/index"));
const InventoryList = lazy(() => import("../InventoryList"));
const EditUserDetails = lazy(() => import("../EditUserDetails"));
const Maintenance = lazy(() => import("../maintenance"));
const Purchase = lazy(() => import("../Purchase"));
const Reports = lazy(() => import("../Reports"));

const PageFallback = () => (
  <Card style={{ margin: 16 }}>
    <Skeleton active paragraph={{ rows: 6 }} />
  </Card>
);

const withSuspense = (node: React.ReactNode) => (
  <Suspense fallback={<PageFallback />}>{node}</Suspense>
);

const router = createBrowserRouter([
  {
    path: "/signin",
    element: withSuspense(<SignIn />),
  },
  {
    path: "/signup",
    element: withSuspense(<SignUp />),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            index: true,
            element: withSuspense(<Dashboard />),
          },
          {
            path: "inventory-list",
            element: withSuspense(<InventoryList />),
          },
          {
            path: "edit-user-details",
            element: withSuspense(<EditUserDetails />),
          },
          {
            path: "maintenance",
            element: withSuspense(<Maintenance />),
          },
          {
            path: "purchase-history",
            element: withSuspense(<Purchase />),
          },
          {
            path: "reports",
            element: withSuspense(<Reports />),
          },
          {
            element: (
              <RoleProtectedRoute allowedRoles={["admin", "super-admin"]} />
            ),
            children: [
              {
                path: "users",
                element: withSuspense(<Users />),
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default router;
