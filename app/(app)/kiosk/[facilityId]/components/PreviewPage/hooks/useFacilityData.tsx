import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useViewClinic } from '@/store/viewClinic/viewClinic';
import type { Floor, Zone } from '@/store/builder/types';
import { buildCorridor } from '@/lib/utils/buildCorridor';

export const useFacilityData = (facilityId: string) => {
  const {
    floors,
    stateFacilityId,
    setStateFacilityId,
    setFloors,
    setSelectedFloorId,
    setZones,
    setFloorsCorridor,
  } = useViewClinic();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!facilityId) return;
    if (!floors.length || stateFacilityId !== facilityId) {
      (async () => {
        setLoading(true);
        const { data: floors } = await supabase
          .from('floors')
          .select('*')
          .eq('facility_id', facilityId)
          .order('idx', { ascending: true });

        const floorsIds = floors?.map((f) => f.id) || [];
        const { data: zones } = await supabase
          .from('zones')
          .select(
            `
              id, floor_id, type, x, y, width, height, color, subtitle, description, time_to, time_from,
              zone_doctors (
                doctor_id,
                doctors (id, full_name, specialty, email, phone)
              )
          `,
          )
          .in('floor_id', floorsIds);

        setFloors(floors as Omit<Floor, 'zones'>[]);
        setStateFacilityId(facilityId);
        setSelectedFloorId(floors?.[0]?.id as string);
        setZones(zones as unknown as Zone[]);
        const floorsZones = {} as Record<string, Zone[]>;
        // @ts-ignore
        zones?.forEach((zone: Zone) => {
          floorsZones[zone.floor_id] = [...(floorsZones?.[zone?.floor_id] || []), zone];
        });
        console.log(floorsZones);
        const floorCorridor = {} as Record<string, boolean[][]>;
        for (const [floorId, floorZones] of Object.entries(floorsZones)) {
          floorCorridor[floorId] = buildCorridor(floorZones);
        }
        console.log(floorCorridor);
        setFloorsCorridor(floorCorridor);
        setLoading(false);
      })();
    }
  }, [facilityId]);


  return { loading };
};