import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

type SummaryRow = {
  work_order_id: number;
  total_parts?: number;
  labor_hours?: number;
  notes_count?: number;
};

export default function SummaryCard({ woId }: { woId: number }) {
  // Use the queryFn wrapper that accepts TanStack's context
  const { data = [], isLoading, error } = useQuery<SummaryRow[], Error>({
    queryKey: ["summary", woId],
    queryFn: api.getSummaryQF,
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-gray-500">
        Loading summary…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-4 text-sm text-red-600">
        Failed to load summary.
      </div>
    );
  }

  // Pick the row for this WO (backend may return an array)
  const row =
    (data || []).find((r: any) => r.work_order_id === woId) ||
    (data as any)[0] ||
    ({} as SummaryRow);

  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="text-sm font-semibold mb-2">Summary</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-gray-500">Parts</div>
          <div className="text-lg font-medium">{row.total_parts ?? 0}</div>
        </div>
        <div>
          <div className="text-gray-500">Labor Hours</div>
          <div className="text-lg font-medium">
            {typeof row.labor_hours === "number" ? row.labor_hours.toFixed(1) : "0.0"}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Notes</div>
          <div className="text-lg font-medium">{row.notes_count ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
