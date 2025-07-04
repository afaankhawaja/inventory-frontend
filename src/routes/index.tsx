import { createBrowserRouter } from "react-router-dom";

import Home from "../Home";
import SignIn from "../SignIn"
import SignUp from "../SignUp"

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignIn />,
  },
  {
    path: "signup",
    element: <SignUp />,
  },
  {
    path: "home",
    element: <Home />,
  },
]);

export default router;
