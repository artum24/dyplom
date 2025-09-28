import { supabase } from '@/lib/supabase';
import { Doctor } from '../../store/builder/types';

export async function listDoctors(facilityId: string): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .eq('facility_id', facilityId)
    .order('full_name');
  if (error) throw error;
  return data ?? [];
}

export async function createDoctor(payload: Partial<Doctor>) {
  const { error } = await supabase.from('doctors').insert(payload);
  if (error) throw error;
}
