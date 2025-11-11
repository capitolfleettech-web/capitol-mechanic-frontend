import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Unit = {
  id: number;
  unit_number: string;
  type?: string;
  odometer?: number | null;
  status?: string | null;
};

export default function UnitsPage() {
  console.log("UnitsPage using API:", import.meta.env.VITE_API_URL);

  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUnits() {
    setLoading(true);
    setError(null);
    try {
      const data = (await api("/units")) as Unit[];
      setUnits(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load units.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUnits();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Units</h1>
        <button
          onClick={loadUnits}
          className="px-4 py-2 rounded-2xl shadow bg-black text-white"
        >
          Refresh
        </button>
      </header>

      <div className="rounded-xl border bg-white p-4">
        {loading ? (
          <div className="text-gray-500">Loading units…</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : units.length === 0 ? (
          <div className="text-gray-600">No units found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Unit #</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Odometer</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {units.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="py-2 pr-4 font-medium">{u.unit_number}</td>
                    <td className="py-2 pr-4 text-gray-700">
                      {u.type || "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {u.odometer !== null && u.odometer !== undefined
                        ? `${u.odometer.toLocaleString()} km`
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 capitalize">
                      {u.status || "unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
