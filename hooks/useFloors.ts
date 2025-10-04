'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useMapBuilder } from '../store/builder/builder';

export function useFloors(facilityId: string) {
  const { floors, setFloors, stateFacilityId, setStateFacilityId } = useMapBuilder();

  useEffect(() => {
    if (!facilityId) return;
    if (!floors.length || stateFacilityId !== facilityId) {
      (async () => {
        const { data } = await supabase
          .from('floors')
          .select('*')
          .eq('facility_id', facilityId)
          .order('idx', { ascending: true });

        if (data) {
          const existingFloorsMap = new Map(floors.map((f) => [f.id, f]));

          const mergedFloors = data.map((floor) => {
            const existingFloor = existingFloorsMap.get(floor.id);
            return {
              ...floor,
              zones: existingFloor?.zones || [],
            };
          });
          setStateFacilityId(facilityId);
          setFloors(mergedFloors);
        }
      })();
    }
  }, [facilityId]);

  async function addFloor(name: string) {
    const { data } = await supabase
      .from('floors')
      .insert({ facility_id: facilityId, idx: floors.length, name })
      .select()
      .single();
    if (data) setFloors([...floors, data]);
  }

  async function renameFloor(id: string, name: string) {
    await supabase.from('floors').update({ name }).eq('id', id);
    setFloors(floors.map((f) => (f.id === id ? { ...f, name } : f)));
  }

  async function removeFloor(id: string) {
    await supabase.from('floors').delete().eq('id', id);
    setFloors(floors.filter((f) => f.id !== id));
  }

  return { floors, addFloor, renameFloor, removeFloor };
}
