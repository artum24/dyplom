import { supabase } from '@/lib/supabase';
import { Zone } from '../../store/builder/types';

export async function upsertZone(zone: Zone) {
  const { error } = await supabase.from('zones').upsert(zone, { onConflict: 'id' });
  if (error) throw error;
}

export async function setZoneDoctors(zoneId: string, doctorIds: string[]) {
  const { error: delErr } = await supabase.from('zone_doctors').delete().eq('zone_id', zoneId);
  if (delErr) throw delErr;

  if (doctorIds.length) {
    const rows = doctorIds.map((doctor_id) => ({ zone_id: zoneId, doctor_id }));
    const { error: insErr } = await supabase.from('zone_doctors').insert(rows);
    if (insErr) throw insErr;
  }
}

export async function getZoneDoctorIds(zoneId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('zone_doctors')
    .select('doctor_id')
    .eq('zone_id', zoneId);
  if (error) throw error;
  return (data ?? []).map((r) => r.doctor_id);
}

export async function fetchZones(floorId: string): Promise<Zone[]> {
  const { data, error } = await supabase
    .from('zones')
    .select('id, floor_id, type, x, y, width, height, color, subtitle, description')
    .eq('floor_id', floorId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createZone(zone: Zone): Promise<void> {
  const { error } = await supabase.from('zones').insert(zone);
  if (error) throw error;
}

export async function updateZone(zone: Zone): Promise<void> {
  const { error } = await supabase
    .from('zones')
    .update({
      type: zone.type,
      x: zone.x,
      y: zone.y,
      width: zone.width,
      height: zone.height,
      color: zone.color,
      subtitle: zone.subtitle ?? null,
      description: zone.description ?? null,
    })
    .eq('id', zone.id);
  if (error) throw error;
}

export async function deleteZone(zoneId: string): Promise<void> {
  const { error } = await supabase.from('zones').delete().eq('id', zoneId);
  if (error) throw error;
}
