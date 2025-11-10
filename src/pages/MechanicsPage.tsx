import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Card } from "@/components/ui/card";

type Mechanic = { id:number; name:string; hourly_rate:string };

export default function MechanicsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["mechanics"],
    queryFn: async () => (await api.get<Mechanic[]>("/mechanics")).data,
  });

  if (isLoading) return <div className="p-6">Loading mechanics…</div>;
  if (error) return <div className="p-6 text-red-600">Failed to load mechanics</div>;

  return (
    <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {data!.map(m => (
        <Card key={m.id} className="p-4 hover:shadow-xl transition">
          <div className="text-xl font-semibold">{m.name}</div>
          <div className="opacity-80">Rate: ${Number(m.hourly_rate).toFixed(2)}/hr</div>
        </Card>
      ))}
    </div>
  );
}
