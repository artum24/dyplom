export type ZoneType =
  | 'room'
  | 'corridor'
  | 'ward'
  | 'operating'
  | 'diagnostics'
  | 'isolation'
  | 'toilet'
  | 'reception';

export interface Zone {
  id: string;
  floor_id: string;
  type: ZoneType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  subtitle?: string;
  description?: string;
}

export interface Floor {
  id: string;
  name: string;
  idx: number;
  zones: Zone[];
}

export interface Doctor {
  id: string;
  facility_id: string;
  full_name: string;
  specialty?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  work_hours?: Record<string, [string, string][]>;
}
