import { createBrowserRouter, Navigate } from "react-router-dom";

import Home from "../Home";
import SignIn from "../SignIn"
import SignUp from "../SignUp"
import ProtectedRoute from "../utils/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/signin",
    element: <SignIn />,
  },
  {
    path: "/",
    element:<Navigate to={'/signin'} replace/>
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "home",
        element: <Home />,
      },
    ],
  },
]);

export default router;
