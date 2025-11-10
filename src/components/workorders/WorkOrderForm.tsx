// src/components/workorders/WorkOrderForm.tsx
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Unit = { id: number; unit_number: string };

const PRIORITIES = ["critical", "high", "medium", "low"] as const;
const CATEGORIES = ["PM", "Brakes", "Engine", "Electrical", "Tires", "Body", "Other"] as const;
const BAYS = ["A","B","C","D","E","F","G","H","I","J","K","L"] as const;

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function WorkOrderForm({ open, onClose }: Props) {
  // --- form state (strings only for selects) ---
  const [unitId, setUnitId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [complaint, setComplaint] = useState("");
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]>("medium");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("Other");
  const [bay, setBay] = useState<string | undefined>(undefined); // optional

  const qc = useQueryClient();

  // Units for the unit select
  const units = useQuery<Unit[]>({
    queryKey: ["units"],
    queryFn: async () => {
      const r = await fetch(`${api}/units`);
      if (!r.ok) throw new Error("Failed to load units");
      return r.json();
    },
    staleTime: 60_000,
  });

  // Create Work Order
  const createWo = useMutation({
    mutationFn: async () => {
      if (!unitId) throw new Error("Select a unit");
      const body = {
        unit_id: Number(unitId),
        title: title.trim(),
        complaint: complaint.trim(),
        priority,
        category,
        bay: bay ?? null, // optional
      };
      const r = await fetch(`${api}/work-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const t = await r.text();
        throw new Error(t || "Failed to create work order");
      }
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-orders"] });
      onClose();
      // reset
      setUnitId(undefined);
      setTitle("");
      setComplaint("");
      setPriority("medium");
      setCategory("Other");
      setBay(undefined);
    },
  });

  // When the dialog opens, ensure state is clean
  useEffect(() => {
    if (!open) return;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Work Order</DialogTitle>
        </DialogHeader>

        {/* Unit */}
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select
            value={unitId}
            onValueChange={setUnitId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              {units.data?.map((u) => (
                <SelectItem key={u.id} value={String(u.id)}>
                  {u.unit_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            placeholder="e.g. Brake inspection"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Complaint */}
        <div className="space-y-2">
          <Label>Complaint</Label>
          <Textarea
            placeholder="Driver notes..."
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
          />
        </div>

        {/* Priority / Category / Bay */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Bay</Label>
            <Select
              value={bay}
              onValueChange={setBay}
            >
              <SelectTrigger>
                <SelectValue placeholder="Optional" />
              </SelectTrigger>
              <SelectContent>
                {BAYS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => createWo.mutate()} disabled={createWo.isPending}>
            {createWo.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
