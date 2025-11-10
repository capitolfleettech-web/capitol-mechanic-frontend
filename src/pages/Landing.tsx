import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <h1 className="text-3xl md:text-5xl font-bold">Capitol Mechanic Shop</h1>
      <p className="opacity-70">Choose your dashboard</p>
      <div className="flex gap-3">
        <Button onClick={() => nav("/owner")}>Owner</Button>
        <Button onClick={() => nav("/dispatch")}>Dispatch</Button>
        <Button onClick={() => nav("/mechanic")}>Mechanic</Button>
      </div>
    </div>
  );
}
