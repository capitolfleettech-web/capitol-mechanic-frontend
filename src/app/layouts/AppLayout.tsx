import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NavLink = ({ to, label }: { to: string; label: string }) => {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");
  return (
    <Link to={to}>
      <Button variant={active ? "default" : "secondary"} size="sm">
        {label}
      </Button>
    </Link>
  );
};

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold">Capitol Mechanic Shop</Link>
          <nav className="flex gap-2">
            <NavLink to="/owner" label="Owner" />
            <NavLink to="/dispatch" label="Dispatch" />
            <NavLink to="/mechanic" label="Mechanic" />
          <NavLink to="/work-orders" label="Work Orders" />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
