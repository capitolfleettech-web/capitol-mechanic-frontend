
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "@/index.css"; // tailwind base
import AppLayout from "@/app/layouts/AppLayout";

// Pages
import Landing from "@/pages/Landing";
import OwnerDashboard from "@/pages/OwnerDashboard";
import DispatchDashboard from "@/pages/DispatchDashboard";
import MechanicDashboard from "@/pages/MechanicDashboard";
import UnitsPage from "@/pages/UnitsPage";
import MechanicsPage from "@/pages/MechanicsPage";
import WorkOrdersPage from "@/pages/WorkOrdersPage";

// (optional) shadcn/ui toaster if you want to use toasts later
import { Toaster } from "@/components/ui/toaster";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/owner", element: <OwnerDashboard /> },
      { path: "/dispatch", element: <DispatchDashboard /> },
      { path: "/mechanic", element: <MechanicDashboard /> },

      // Data views you already have
      { path: "/units", element: <UnitsPage /> },
      { path: "/mechanics", element: <MechanicsPage /> },

      // NEW: shared Work Orders hub (tabs inside the page)
      { path: "/work-orders", element: <WorkOrdersPage /> },
    ],
  },
]);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
);
