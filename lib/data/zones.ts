import { supabase } from '@/lib/supabase';

export async function setZoneDoctors(zoneId: string, doctorIds: string[], stateFacilityId: string) {
  const { error: delErr } = await supabase.from('zone_doctors').delete().eq('zone_id', zoneId);
  if (delErr) throw delErr;

  if (doctorIds.length) {
    const rows = doctorIds.map((doctor_id) => ({
      zone_id: zoneId,
      doctor_id,
    }));
    const { error: insErr } = await supabase.from('zone_doctors').insert(rows);
    if (insErr) throw insErr;
  }
}
