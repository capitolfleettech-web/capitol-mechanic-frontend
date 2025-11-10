import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

export default function OwnerDashboard() {
  const nav = useNavigate();
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Owner Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">Jobs in progress (soon)</Card>
        <Card className="p-4">Hours today (soon)</Card>
        <Card className="p-4">Parts low stock (soon)</Card>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => nav("/owner/units")}>View Units</Button>
        <Button variant="secondary" onClick={() => nav("/owner/mechanics")}>View Mechanics</Button>
      </div>
    </div>
  );
}
