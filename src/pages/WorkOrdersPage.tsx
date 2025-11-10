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
  unit_number?: string; // backend may already join; if not, we map it
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

  // data sets
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // page states
  const [woLoading, setWoLoading] = useState(true);
  const [woError, setWoError] = useState<string | null>(null);

  const [unitsLoading, setUnitsLoading] = useState(true);
  const [unitsError, setUnitsError] = useState<string | null>(null);

  // modal state
  const [openModal, setOpenModal] = useState(false);
  const [formUnitId, setFormUnitId] = useState<number | "">("");
  const [formTitle, setFormTitle] = useState("");
  const [formComplaint, setFormComplaint] = useState("");
  const [formPriority, setFormPriority] = useState<Priority>("medium");
  const [formCategory, setFormCategory] = useState<string>("Other");
  const [formBay, setFormBay] = useState<string>("");

  const canCreate =
    formUnitId !== "" && formTitle.trim() !== "" && formComplaint.trim() !== "";

  // ------- data loaders -------
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
    // load both datasets; units used by the create modal + mapping
    loadUnits();
    loadWorkOrders();
  }, []);

  // map unit_number if backend doesn't include it in work_orders list
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

      // reset + refresh
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

      {/* Tabs */}
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

      {/* Content */}
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
                <
