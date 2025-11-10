import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PartsPanel({
  woId,
  enabled,
}: {
  woId: number;
  enabled: boolean;
}) {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 250);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isFetching } = useQuery({
    queryKey: ["parts", debounced],
    queryFn: () => (debounced ? api.searchParts(debounced) : Promise.resolve([])),
  });

  const [qtyById, setQtyById] = useState<Record<number, number>>({});

  const attach = useMutation({
    mutationFn: ({ id, qty }: { id: number; qty: number }) =>
      api.attachPart(woId, id, qty),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parts-attached", woId] });
    },
  });

  return (
    <div className="space-y-3">
      <div>
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search inventory by part # or name…"
        />
        <div className="text-xs text-muted-foreground mt-1">
          {isFetching ? "Searching…" : debounced ? "" : "Type to search"}
        </div>
      </div>

      <div className="max-h-64 overflow-auto space-y-2 pr-1">
        {(data || []).map((p: any) => (
          <div key={p.id} className="flex items-center justify-between rounded border p-2">
            <div className="text-sm">
              <div className="font-medium">{p.part_number}</div>
              <div className="text-muted-foreground text-xs">{p.part_name}</div>
              <div className="text-xs mt-1">
                In stock: <b>{p.stock_qty ?? 0}</b> • Cost: ${Number(p.unit_cost ?? 0).toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={qtyById[p.id] ?? 1}
                onChange={(e) =>
                  setQtyById((s) => ({ ...s, [p.id]: Math.max(1, Number(e.target.value || 1)) }))
                }
                className="w-16"
              />
              <Button
                size="sm"
                disabled={!enabled || attach.isPending}
                onClick={() => attach.mutate({ id: p.id, qty: qtyById[p.id] ?? 1 })}
              >
                {enabled ? (attach.isPending ? "Adding…" : "Add") : "Only in progress"}
              </Button>
            </div>
          </div>
        ))}

        {data && data.length === 0 && debounced && (
          <div className="text-sm text-muted-foreground">No matches.</div>
        )}
      </div>
    </div>
  );
}
