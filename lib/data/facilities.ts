import { supabase } from '@/lib/supabase';

export async function createFacility(name: string) {
  const { data, error } = await supabase.from('facilities').insert({ name }).select('*').single();
  if (error) throw error;
  return data;
}

export async function togglePublic(facilityId: string, isPublic: boolean) {
  const { error } = await supabase
    .from('facilities')
    .update({ is_public: isPublic })
    .eq('id', facilityId);
  if (error) throw error;
}
