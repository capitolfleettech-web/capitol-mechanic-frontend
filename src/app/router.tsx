import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Landing from "../pages/Landing";
import OwnerDashboard from "../pages/OwnerDashboard";
import DispatchDashboard from "../pages/DispatchDashboard";
import MechanicDashboard from "../pages/MechanicDashboard";
import UnitsPage from "../pages/UnitsPage";
import MechanicsPage from "../pages/MechanicsPage";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "owner", element: <OwnerDashboard /> },
      { path: "owner/units", element: <UnitsPage /> },
      { path: "owner/mechanics", element: <MechanicsPage /> },
      { path: "dispatch", element: <DispatchDashboard /> },
      { path: "mechanic", element: <MechanicDashboard /> },
    ],
  },
]);
