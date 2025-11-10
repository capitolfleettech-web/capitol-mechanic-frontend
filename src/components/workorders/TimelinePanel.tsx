import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function TimelinePanel({ woId }: { woId: number }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["wo-timeline", woId],
    queryFn: () => api.getTimeline(woId),
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading…</div>;
  if (error) return <div className="text-sm text-red-600">Failed to load timeline</div>;

  return (
    <ul className="space-y-2 max-h-64 overflow-auto pr-1">
      {(data || []).map((e: any) => (
        <li key={e.id} className="rounded border p-2">
          <div className="text-xs text-muted-foreground">
            {new Date(e.created_at).toLocaleString()}
          </div>
          <div className="text-sm">
            <span className="font-medium">{e.event_type}</span>
            {e.details ? <span className="text-muted-foreground"> — {e.details}</span> : null}
          </div>
        </li>
      ))}
      {(!data || data.length === 0) && (
        <div className="text-sm text-muted-foreground">No events yet.</div>
      )}
    </ul>
  );
}
