import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

type Mechanic = {
  id: number;
  name: string;
  email?: string | null;
  status?: string | null;
};

export default function MechanicsPage() {
  const { data = [], isLoading, error } = useQuery<Mechanic[], Error>({
    queryKey: ["mechanics"],
    queryFn: api.getMechanicsQF,
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Mechanics</h1>

      <div className="rounded-xl border bg-white p-4">
        {isLoading ? (
          <div className="text-gray-500">Loading mechanics…</div>
        ) : error ? (
          <div className="text-red-600">Failed to load mechanics.</div>
        ) : (data || []).length === 0 ? (
          <div className="text-gray-600">No mechanics found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((m) => (
                  <tr key={m.id} className="border-t">
                    <td className="py-2 pr-4 font-medium">{m.name}</td>
                    <td className="py-2 pr-4">{m.email ?? "—"}</td>
                    <td className="py-2 pr-4 capitalize">{m.status ?? "active"}</td>
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
