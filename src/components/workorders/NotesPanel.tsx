import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function NotesPanel({ woId }: { woId: number }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["wo-notes", woId],
    queryFn: () => api.getNotes(woId),
  });
  const [txt, setTxt] = useState("");

  const add = useMutation({
    mutationFn: () => api.addNote(woId, "Owner", txt.trim()),
    onSuccess: () => {
      setTxt("");
      qc.invalidateQueries({ queryKey: ["wo-notes", woId] });
    },
  });

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading...</div>;
  if (error) return <div className="text-sm text-red-600">Failed to load notes</div>;

  return (
    <div className="space-y-3">
      <div className="space-y-2 max-h-64 overflow-auto pr-1">
        {(data || []).map((n: any) => (
          <div key={n.id} className="rounded border p-2">
            <div className="text-xs text-muted-foreground flex gap-2">
              <span>{n.author}</span>
              <span>•</span>
              <span>{new Date(n.created_at).toLocaleString()}</span>
            </div>
            <div className="text-sm whitespace-pre-wrap">{n.message}</div>
          </div>
        ))}
        {(!data || data.length === 0) && (
          <div className="text-sm text-muted-foreground">No notes yet.</div>
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Add a note…"
          value={txt}
          onChange={(e) => setTxt(e.target.value)}
          maxLength={2000}
        />
        <div className="flex justify-end">
          <Button size="sm" onClick={() => add.mutate()} disabled={!txt.trim() || add.isPending}>
            {add.isPending ? "Saving..." : "Add note"}
          </Button>
        </div>
      </div>
    </div>
  );
}
