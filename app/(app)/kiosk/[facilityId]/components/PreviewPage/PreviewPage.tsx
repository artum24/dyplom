'use client';
import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs/Tabs';
import { Header } from '@/app/(app)/kiosk/[facilityId]/components/PreviewPage/components/Header/Header';
import { Actions } from '@/app/(app)/kiosk/[facilityId]/components/PreviewPage/components/Actions/Actions';
import { Floor } from '@/store/builder/types';
import { Legend } from '@/app/(app)/kiosk/[facilityId]/components/PreviewPage/components/Legend/Legend';
import { DoctorSidebar } from '@/app/(app)/kiosk/[facilityId]/components/PreviewPage/components/DoctorSidebar/DoctorSidebar';
import { ZoneGrid } from '@/components/ZoneGrid/ZoneGrid';
import { useParams } from 'next/navigation';
import { useViewClinic } from '@/store/viewClinic/viewClinic';
import { useFacilityData } from '@/app/(app)/kiosk/[facilityId]/components/PreviewPage/hooks/useFacilityData';

export default function PatientFacilityNavigator() {
  const params = useParams();
  const facilityId = params.facilityId;

  const [query, setQuery] = useState('');

  useFacilityData(facilityId as string);
  const { selectedFloorId, zones, floors, setSelectedFloorId } = useViewClinic();

  const zonesOnFloor = useMemo(
    () => zones.filter((z) => z.floor_id === selectedFloorId),
    [selectedFloorId, zones]
  );

  const activeZones = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return zonesOnFloor;
    return zonesOnFloor.filter(
      (z) =>
        z?.subtitle?.toLowerCase().includes(q) ||
        z.zone_doctors?.some(
          (d) =>
            d.doctors.full_name.toLowerCase().includes(q) ||
            d.doctors.specialty?.toLowerCase().includes(q)
        )
    );
  }, [zonesOnFloor, query]);

  const layout = zonesOnFloor.map((zone) => ({
    i: zone.id,
    x: zone.x,
    y: zone.y,
    w: zone.width,
    h: zone.height,
    minW: zone.minW || 2,
    minH: zone.minH || 2,
    isDraggable: false,
    isResizable: false,
  }));

  return (
    <div className="h-[calc(100vh-61px)] bg-slate-50 text-slate-900">
      <Header />
      <Actions query={query} setQuery={setQuery} />

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
                    minHeight="340px"
                    layout={layout}
                    zones={zonesOnFloor}
                    floor={floor as unknown as Floor}
                    isEditable={false}
                  />
                  <Legend />
                </div>
                <DoctorSidebar zonesOnFloor={activeZones} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
