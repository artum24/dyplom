export type ZoneType =
  | 'room'
  | 'ward'
  | 'operating'
  | 'diagnostics'
  | 'isolation'
  | 'toilet'
  | 'reception'
  | 'exit' | 'lift' | 'stairs' | 'transition';

export interface Zone {
  id: string;
  floor_id: string;
  type: ZoneType;
  x: number;
  y: number;
  width: number;
  height: number;
  minW?: number;
  minH?: number;
  color: string;
  subtitle?: string;
  description?: string;
  zone_doctors?: {
    doctor_id: string;
    doctors: Doctor;
  }[];
  time_from?: string;
  time_to?: string;
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
}
