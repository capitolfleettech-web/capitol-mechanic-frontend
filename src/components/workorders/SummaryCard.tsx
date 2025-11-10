import { useQuery } from "@tanstack/react-query";
import { api, woNumber } from "@/lib/api";

export default function SummaryCard({ woId }: { woId: number }) {
  const { data } = useQuery({
    queryKey: ["wo-summary"],
    queryFn: api.getSummary,
    staleTime: 30_000,
  });

  const row = (data || []).find((r: any) => r.work_order_id === woId);
  if (!row) return null;

  const hours = Number(row.total_hours || 0);
  const parts = Number(row.parts_cost || 0);

  return (
    <div className="rounded-lg border p-3 bg-muted/30">
      <div className="text-xs text-muted-foreground">Summary for {woNumber(woId)}</div>
      <div className="mt-1 flex gap-6 text-sm">
        <div>Labor hours: <b>{hours.toFixed(2)}</b></div>
        <div>Parts cost: <b>${parts.toFixed(2)}</b></div>
      </div>
    </div>
  );
}
