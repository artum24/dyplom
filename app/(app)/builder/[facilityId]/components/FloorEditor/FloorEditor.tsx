'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Layout } from 'react-grid-layout';
import { useMapBuilder } from '@/store/builder/builder';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from '@/components/ui/Button/Button';
import { Loader } from 'lucide-react';
import { ZoneGrid } from '@/components/ZoneGrid/ZoneGrid';
import { v4 as uuidv4 } from 'uuid';
import { Doctor, ZoneType } from '@/store/builder/types';
import { cn } from '@/lib/utils/utils';
import { useModal } from '@/store/modal/modal';
import { PRESETS } from '@/app/(app)/builder/[facilityId]/components/Palette/Palette';

export const FloorEditor = ({ floorName, doctors }: { floorName: string, doctors: Doctor[] }) => {
  const {
    floors,
    selectedFloorIndex,
    updateZonesInCurrentFloor,
    saveZonesToDatabase,
    loadZonesForFloor,
    addZoneToCurrentFloor,
    dragItem,
  } = useMapBuilder();
  const { setDoctors } = useModal();
  const floor = selectedFloorIndex != null ? floors[selectedFloorIndex] : null;
  const zones = floor?.zones || [];
  const [isLoading, setIsLoading] = useState(false);
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const layout = zones.map((zone) => ({
    i: zone.id,
    x: zone.x,
    y: zone.y,
    w: zone.width,
    h: zone.height,
    minW: zone.minW || 2,
    minH: zone.minH || 2,
    isDraggable: true,
    isResizable: true,
  }));

  useEffect(() => {
    setDoctors(doctors);
  }, [doctors]);

  useEffect(() => {
    if (!floor || !floor.id) return;

    if (loadingState[floor.id]) return;

    if (floor.zones && floor.zones.length > 0) {
      return;
    }

    setIsLoading(true);

    loadZonesForFloor(floor.id)
      .then(() => {
        setLoadingState((prev) => ({ ...prev, [floor.id]: true }));
      })
      .finally(() => setIsLoading(false));
  }, [floor?.id, loadZonesForFloor, loadingState]);

  const interactionRef = useRef(false);

  const onInteraction = useCallback(() => {
    interactionRef.current = true;
  }, []);

  const onLayoutChange = useCallback((nextLayout: Layout[]) => {
    if (!interactionRef.current) {
      return;
    }

    updateZonesInCurrentFloor(nextLayout);

    interactionRef.current = false;
  }, []);

  if (!floor)
    return (
      <div className="p-6 text-gray-400 h-full flex justify-center items-center text-2xl">
        Оберіть поверх
      </div>
    );

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-full">
        <Loader className="animate-spin" />
        <div className="text-gray-600 text-2xl">Завантаження зон...</div>
      </div>
    );
  }

  const onSubmit = async () => {
    if (floor) {
      setIsSaving(true);
      await saveZonesToDatabase(floor.id);
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">{floorName ?? 'Поверх'}</h1>
        <Button onClick={onSubmit}>Зберегти</Button>
      </div>
      <div className={cn('relative', { 'opacity-40': isSaving })}>
        {isSaving && (
          <div
            className="z-20 flex gap-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 items-center">
            <Loader className="spin animate-spin" />
            <span>Збереження Зон</span>
          </div>
        )}
        <ZoneGrid
          layout={layout}
          onLayoutChange={onLayoutChange}
          onInteraction={onInteraction}
          zones={zones}
          floor={floor}
          isEditable={true}
          onDrop={(_, item) => {
            const getZone = PRESETS.find((zone) => zone.type === dragItem?.type);
            addZoneToCurrentFloor({
              id: uuidv4(),
              floor_id: floor.id,
              type: dragItem?.type as ZoneType,
              x: item.x,
              y: item.y,
              width: item.w,
              height: item.h,
              minW: getZone?.minW,
              minH: getZone?.minH,
              color: dragItem?.color as string,
              subtitle: dragItem?.label as string,
            });
          }}
        />
      </div>
    </div>
  );
};
