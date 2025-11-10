import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Mechanic, WorkOrder } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function WorkOrderTable({
  rows,
  currentMechanic,
}: {
  rows: WorkOrder[];
  currentMechanic?: Mechanic | null;
}) {
  const qc = useQueryClient();

  const refetch = () => {
    qc.invalidateQueries({ queryKey: ['work-orders'] });
    qc.invalidateQueries({ queryKey: ['work-orders','pending'] });
    qc.invalidateQueries({ queryKey: ['work-orders','in_progress'] });
    qc.invalidateQueries({ queryKey: ['work-orders','on_hold'] });
    qc.invalidateQueries({ queryKey: ['work-orders','completed'] });
  };

  const mAssign = useMutation({
    mutationFn: ({ id, mechanic_id }: { id:number; mechanic_id:number }) => api.assign(id, mechanic_id),
    onSuccess: refetch,
  });
  const mStart = useMutation({
    mutationFn: ({ id, mechanic_id, odometer }: { id:number; mechanic_id:number; odometer:number }) =>
      api.start(id, mechanic_id, odometer),
    onSuccess: refetch,
  });
  const mPause = useMutation({
    mutationFn: ({ id, mechanic_id, reason }: { id:number; mechanic_id:number; reason:string }) =>
      api.pause(id, mechanic_id, reason),
    onSuccess: refetch,
  });
  const mResume = useMutation({
    mutationFn: ({ id, mechanic_id }: { id:number; mechanic_id:number }) =>
      api.resume(id, mechanic_id),
    onSuccess: refetch,
  });
  const mComplete = useMutation({
    mutationFn: ({ id, mechanic_id }: { id:number; mechanic_id:number }) =>
      api.complete(id, mechanic_id),
    onSuccess: refetch,
  });

  function priorityBadge(p: string) {
    const tone = p === 'critical' ? 'destructive' : p === 'high' ? 'secondary' : 'outline';
    return <Badge variant={tone as any} className="uppercase">{p}</Badge>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">WO #</th>
            <th>Unit</th>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Bay</th>
            <th>Opened</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id} className="border-b">
              <td className="py-2">{r.id}</td>
              <td>{r.unit_number ?? r.unit_id}</td>
              <td>{r.title}</td>
              <td>{priorityBadge(r.priority)}</td>
              <td>{r.status}{r.on_hold ? ' (On Hold)' : ''}</td>
              <td>{r.bay ?? '-'}</td>
              <td>{new Date(r.opened_at).toLocaleString()}</td>
              <td className="text-right">
                <div className="inline-flex gap-2">
                  {currentMechanic && (
                    <>
                      <Button size="sm" variant="secondary"
                        onClick={()=>mAssign.mutate({ id: r.id, mechanic_id: currentMechanic.id })}>
                        Assign to me
                      </Button>

                      {r.status === 'pending' && (
                        <Button size="sm" onClick={()=>{
                          const odo = Number(prompt('Enter odometer:',''));
                          if (!Number.isFinite(odo)) return;
                          mStart.mutate({ id: r.id, mechanic_id: currentMechanic.id, odometer: odo });
                        }}>Start</Button>
                      )}

                      {r.status === 'in_progress' && !r.on_hold && (
                        <Button size="sm" variant="outline" onClick={()=>{
                          const reason = prompt('Pause reason (optional):','Waiting parts') || 'Pause';
                          mPause.mutate({ id: r.id, mechanic_id: currentMechanic.id, reason });
                        }}>Pause</Button>
                      )}

                      {r.status === 'in_progress' && r.on_hold && (
                        <Button size="sm" variant="outline"
                          onClick={()=>mResume.mutate({ id: r.id, mechanic_id: currentMechanic.id })}>
                          Resume
                        </Button>
                      )}

                      {r.status === 'in_progress' && (
                        <Button size="sm" variant="default"
                          onClick={()=>mComplete.mutate({ id: r.id, mechanic_id: currentMechanic.id })}>
                          Complete
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={8} className="py-6 text-center text-muted-foreground">No work orders.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
