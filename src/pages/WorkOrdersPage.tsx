import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";

type WorkOrderStatus = "pending" | "in-progress" | "on-hold" | "completed";
type Priority = "low" | "medium" | "high";

type Unit = {
  id: number;
  unit_number: string;
  type?: string;
  odometer?: number | null;
  status?: string;
};

type WorkOrder = {
  id: number;
  unit_id: number;
  unit_number?: string;
  title: string;
  complaint: string;
  priority: Priority;
  category?: string | null;
  bay?: string | null;
  status: WorkOrderStatus;
  opened_at?: string;
  closed_at?: string | null;
};

export default function WorkOrdersPage() {
  console.log("WorkOrdersPage using API:", import.meta.env.VITE_API_URL);

  const [activeTab, setActiveTab] = useState<WorkOrderStatus>("pending");

  // data
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // states
  const [woLoading, setWoLoading] = useState(true);
  const [woError, setWoError] = useState<string | null>(null);
  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  // modal/form
  const [openModal, setOpenModal] = useState(false);
  const [formUnitId, setFormUnitId] = useState<number | "">("");
  const [formTitle, setFormTitle] = useState("");
  const [formComplaint, setFormComplaint] = useState("");
  const [formPriority, setFormPriority] = useState<Priority>("medium");
  const [formCategory, setFormCategory] = useState<string>("Other");
  const [formBay, setFormBay] = useState<string>("");

  const canCreate =
    formUnitId !== "" && formTitle.trim() !== "" && formComplaint.trim() !== "";

  async function loadWorkOrders() {
    setWoLoading(true);
    setWoError(null);
    try {
      const data = (await api("/work-orders")) as WorkOrder[];
      setWorkOrders(data);
    } catch (e: any) {
      console.error(e);
      setWoError("Failed to load work orders.");
    } finally {
      setWoLoading(false);
    }
  }

  async function loadUnits() {
    setUnitsLoading(true);
    setUnitsError(null);
    try {
      const data = (await api("/units")) as Unit[];
      setUnits(data);
    } catch (e: any) {
      console.error(e);
      setUnitsError("Failed to load units.");
    } finally {
      setUnitsLoading(false);
    }
  }

  useEffect(() => {
    loadUnits();
    loadWorkOrders();
  }, []);

  const unitMap = useMemo(() => {
    const m = new Map<number, Unit>();
    for (const u of units) m.set(u.id, u);
    return m;
  }, [units]);

  const filtered = useMemo(() => {
    return workOrders
      .filter((w) => w.status === activeTab)
      .map((w) => ({
        ...w,
        unit_number:
          w.unit_number ?? unitMap.get(w.unit_id)?.unit_number ?? "—",
      }));
  }, [workOrders, activeTab, unitMap]);

  async function handleCreate() {
    if (!canCreate) return;
    try {
      await api("/work-orders", {
        method: "POST",
        body: JSON.stringify({
          unit_id: formUnitId,
          title: formTitle.trim(),
          complaint: formComplaint.trim(),
          priority: formPriority,
          category: formCategory || "Other",
          bay: formBay || null,
          status: "pending",
        }),
      });

      setOpenModal(false);
      setFormUnitId("");
      setFormTitle("");
      setFormComplaint("");
      setFormPriority("medium");
      setFormCategory("Other");
      setFormBay("");
      await loadWorkOrders();
    } catch (e: any) {
      alert(
        `Failed to create work order.\n\n${
          e?.message ?? "Unknown error — check network tab."
        }`
      );
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Work Orders</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 rounded-2xl shadow bg-black text-white"
        >
          New Work Order
        </button>
      </header>

      <div className="mb-4">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {[
            { key: "pending", label: "Pending" },
            { key: "in-progress", label: "In-Progress" },
            { key: "on-hold", label: "On-Hold" },
            { key: "completed", label: "Completed" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as WorkOrderStatus)}
              className={`px-3 py-1 rounded-lg text-sm ${
                activeTab === t.key
                  ? "bg-white shadow font-medium"
                  : "text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-4 bg-white">
        {woLoading ? (
          <div className="text-gray-500">Loading work orders…</div>
        ) : woError ? (
          <div className="text-red-600">{woError}</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-600">No work orders in this tab.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500">
                  <th className="py-2 pr-4">Unit</th>
                  <th className="py-2 pr-4">Title</th>
                  <th className="py-2 pr-4">Complaint</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Opened</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((w) => (
                  <tr key={w.id} className="border-t">
                    <td className="py-2 pr-4 font-medium">{w.unit_number}</td>
                    <td className="py-2 pr-4">{w.title}</td>
                    <td className="py-2 pr-4 text-gray-700">
                      {w.complaint?.slice(0, 80) || "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          w.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : w.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {w.priority}
                      </span>
                    </td>
                    <td className="py-2 pr-4 capitalize">{w.status}</td>
                    <td className="py-2 pr-4">
                      {w.opened_at
                        ? new Date(w.opened_at).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Create Work Order</h2>
              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-500 hover:text-black"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Minimal details for now. You can edit later.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Unit</label>
                <select
                  className="mt-1 w-full border rounded-lg p-2"
                  value={formUnitId}
                  onChange={(e) =>
                    setFormUnitId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                >
                  <option value="">Select unit</option>
                  {unitsLoading ? (
                    <option>Loading…</option>
                  ) : unitsError ? (
                    <option disabled>Failed to load units</option>
                  ) : (
                    units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.unit_number} {u.type ? `• ${u.type}` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Title</label>
                <input
                  className="mt-1 w-full border rounded-lg p-2"
                  placeholder="e.g. Brake inspection"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Complaint</label>
                <textarea
                  className="mt-1 w-full border rounded-lg p-2"
                  placeholder="Driver notes…"
                  rows={3}
                  value={formComplaint}
                  onChange={(e) => setFormComplaint(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Priority</label>
                  <select
                    className="mt-1 w-full border rounded-lg p-2"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as Priority)}
                  >
                    <option value="low">low</option>
                    <option value="medium">medium</option>
                    <option value="high">high</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Category</label>
                  <select
                    className="mt-1 w-full border rounded-lg p-2"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option>Other</option>
                    <option>PM Service</option>
                    <option>Engine</option>
                    <option>Brakes</option>
                    <option>Electrical</option>
                    <option>Reefer</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Bay (optional)</label>
                  <input
                    className="mt-1 w-full border rounded-lg p-2"
                    placeholder="e.g. Bay 1"
                    value={formBay}
                    onChange={(e) => setFormBay(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded-xl border"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!canCreate}
                className={`px-4 py-2 rounded-xl shadow ${
                  canCreate ? "bg-black text-white" : "bg-gray-300 text-gray-600"
                }`}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
