'use client';
import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/Tabs';
import { Header } from '@/app/(app)/kiosk/[facilityId]/components/PreviewPage/components/Header/Header';
import { Actions } from '@/app/(app)/kiosk/[facilityId]/components/PreviewPage/components/Actions/Actions';
import { Floor } from '@/store/builder/types';
import { Legend } from '@/app/(app)/kiosk/[facilityId]/components/PreviewPage/components/Legend/Legend';
import {
  DoctorSidebar,
} from '@/app/(app)/kiosk/[facilityId]/components/PreviewPage/components/DoctorSidebar/DoctorSidebar';
import { ZoneGrid } from '@/components/ZoneGrid/ZoneGrid';
import { useParams } from 'next/navigation';
import { useViewClinic } from '@/store/viewClinic/viewClinic';
import { useFacilityData } from '@/app/(app)/kiosk/[facilityId]/components/PreviewPage/hooks/useFacilityData';
import { buildMultiFloorRoute } from '@/lib/utils/multifloor';
import { Cell } from '@/lib/utils/routing';

export default function PatientFacilityNavigator() {
  const params = useParams();
  const facilityId = params.facilityId as string;

  const [query, setQuery] = useState('');
  const [pathByFloor, setPathByFloor] = useState<Record<string, Cell[]>>({});

  useFacilityData(facilityId);
  const { selectedFloorId, zones, floors, setSelectedFloorId } = useViewClinic();

  const zonesOnFloor = useMemo(
    () => zones.filter((z) => z.floor_id === selectedFloorId),
    [selectedFloorId, zones],
  );

  const allDoctors = useMemo(() => {
    const acc: Array<{
      id: string;
      full_name: string;
      specialty?: string | null;
      zone_id: string;
      floor_id: string;
    }> = [];
    const seen = new Set<string>();
    for (const z of zones) {
      z.zone_doctors?.forEach((rel: any) => {
        const d = rel.doctors;
        if (!d || seen.has(d.id)) return;
        seen.add(d.id);
        acc.push({
          id: d.id,
          full_name: d.full_name,
          specialty: d.specialty ?? null,
          zone_id: String(z.id),
          floor_id: String(z.floor_id),
        });
      });
    }
    return acc;
  }, [zones]);


  const activeZones = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zonesOnFloor;
    return zonesOnFloor.filter(
      (z: any) =>
        z?.subtitle?.toLowerCase().includes(q) ||
        z.zone_doctors?.some((d: any) =>
          d.doctors.full_name.toLowerCase().includes(q) ||
          d.doctors.specialty?.toLowerCase().includes(q),
        ),
    );
  }, [zonesOnFloor, query]);

  const layout = zonesOnFloor.map((zone) => ({
    i: zone.id, x: zone.x, y: zone.y, w: zone.width, h: zone.height,
    minW: zone.minW || 2, minH: zone.minH || 2, isDraggable: false, isResizable: false,
  }));

  const handlePickDoctor = (doctorId: string) => {
    const picked = allDoctors.find((d) => d.id === doctorId);
    if (!picked) return;
    const { byFloor } = buildMultiFloorRoute(
      zones, picked.zone_id,
    );

    setPathByFloor(byFloor);
    if (picked.floor_id && picked.floor_id !== selectedFloorId) {
      setSelectedFloorId(picked.floor_id);
    }
    setQuery(picked.full_name);
  };

  return (
    <div className="h-[calc(100vh-61px)] bg-slate-50 text-slate-900">
      <Header />
      <Actions query={query} setQuery={setQuery} doctors={allDoctors} onPickDoctor={handlePickDoctor} />

      <section className="mx-auto px-4 pb-6">
        <Tabs value={selectedFloorId as string} onValueChange={setSelectedFloorId}>
          <div className="flex items-center justify-between">
            <TabsList className="flex flex-wrap">
              {floors.map((floor) => (
                <TabsTrigger key={floor.id} value={floor.id}>
                  {floor.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {floors.map((floor) => (
            <TabsContent key={floor.id} value={floor.id} className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-8 gap-4">
                <div className="lg:col-span-6">
                  <ZoneGrid
                    activeZones={query.trim().toLowerCase().length ? activeZones : []}
                    layout={layout}
                    zones={zonesOnFloor}
                    floor={floor as unknown as Floor}
                    isEditable={false}
                    pathCells={pathByFloor[floor.id] || []}   // ⬅️ нове
                  />
                  <Legend />
                </div>
                <DoctorSidebar zonesOnFloor={zonesOnFloor} onPickDoctor={handlePickDoctor} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}