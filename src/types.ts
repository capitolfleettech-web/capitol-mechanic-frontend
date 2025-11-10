export type Unit = {
  id: number;
  unit_number: string;
  type: 'truck' | 'reefer';
  odometer: number;
  status: string;
};

export type Mechanic = {
  id: number;
  name: string;
  hourly_rate: number;
  active?: boolean;
};

export type WorkOrderStatus = 'pending' | 'in_progress' | 'completed' | 'canceled';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Category = 'PM' | 'Brakes' | 'Engine' | 'Electrical' | 'Tires' | 'Body' | 'Other';
export type Bay = 'A'|'B'|'C'|'D'|'E'|'F'|'G'|'H'|'I'|'J'|'K'|'L';

export type WorkOrder = {
  id: number;
  unit_id: number;
  unit_number?: string;
  title: string;
  complaint?: string;
  status: WorkOrderStatus;
  priority: Priority;
  category: Category;
  bay?: Bay;
  on_hold: boolean;
  hold_reason?: string | null;
  odometer_start?: number | null;
  opened_at: string;
  closed_at?: string | null;
  mechanic_name?: string | null; // optional, if backend returns it
};
