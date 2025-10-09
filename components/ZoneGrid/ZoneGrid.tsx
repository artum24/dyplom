import { COLS, MARGIN, PADDING, ROWS } from '@/app/(app)/builder/[facilityId]/components/FloorEditor/constants';
import ReactGridLayout, { Layout } from 'react-grid-layout';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Floor, Zone } from '@/store/builder/types';
import { ZoneCard } from '@/app/(app)/builder/[facilityId]/components/ZoneCard/ZoneCard';
import { useModal } from '@/store/modal/modal';
import { useMapBuilder } from '@/store/builder/builder';
import { cn } from '@/lib/utils/utils';

type ZoneGridProps = {
  layout: Layout[];
  onLayoutChange?: (layout: Layout[]) => void;
  onInteraction?: () => void;
  onDrop?: (layout: Layout[], item: Layout) => void;
  floor: Floor;
  zones: Zone[];
  isEditable: boolean;
  activeZones?: Zone[];
  pathZoneIds?: string[]
};

export const ZoneGrid = ({
                           layout,
                           onLayoutChange,
                           onInteraction,
                           onDrop,
                           zones,
                           floor,
                           isEditable,
                           activeZones,
                           pathZoneIds = [],
                         }: ZoneGridProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { openZoneEdit } = useModal();
  const { removeZoneFromCurrentFloor, dragItem } = useMapBuilder();
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(640);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        setWidth(el.clientWidth);
        setHeight(el.clientHeight);
      });
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    setHeight(el.clientHeight);
    return () => ro.disconnect();
  }, [floor, zones, layout]);

  const innerW = width - PADDING[0] * 2 - MARGIN[0] * (COLS - 1);

  const cellW = Math.max(20, innerW / COLS);
  const cellH = Math.max(20, height / ROWS);

  const [centers, setCenters] = useState<Record<string, { x: number; y: number }>>({});
  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const next: Record<string, { x: number; y: number }> = {};
    zones.forEach((z) => {
      const el = container.querySelector<HTMLElement>(`[data-zone-id="${z.id}"]`);
      if (!el) return;
      const r = el.getBoundingClientRect();
      next[z.id] = { x: r.left - rect.left + r.width / 2, y: r.top - rect.top + r.height / 2 };
    });
    setCenters(next);
  }, [zones, width, height, layout]);


  const visibleSegments = useMemo(() => {
    const ids = pathZoneIds.filter((id) => zones.some((z) => z.id === id));
    const segs: Array<[string, string]> = [];
    for (let i = 1; i < ids.length; i++) segs.push([ids[i - 1], ids[i]]);
    return segs;
  }, [pathZoneIds, zones]);

  return (
    <div className="relative mx-auto w-full overflow-hidden rounded-md border bg-white">
      <div
        ref={ref}
        className={cn(`relative mx-auto w-full overflow-hidden rounded-md border bg-gray-50 h-[calc(100vh-150px)]`, {
          'h-[calc(100vh-150px)]': isEditable,
          'h-[calc(100vh-340px)]': !isEditable,
        })}
        style={{
          backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.9) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.9) 1px, transparent 1px)
            `,
          backgroundSize: `${cellW + MARGIN[0]}px ${cellH}px`,
          backgroundPosition: `${0}px ${0}px`,
        }}
      >
        {isEditable ? (
          // @ts-ignore
          <ReactGridLayout
            className="layout h-full"
            draggableCancel=".action"
            layout={layout as unknown as Layout[]}
            width={width}
            cols={COLS}
            maxRows={ROWS}
            rowHeight={cellH}
            margin={[1, 1]}
            containerPadding={[0, 0]}
            resizeHandles={isEditable ? ['se', 'ne', 'sw', 'nw'] : []}
            compactType={null}
            preventCollision
            isBounded={false}
            isDraggable
            isResizable
            isDroppable
            onLayoutChange={onLayoutChange}
            onDragStart={onInteraction}
            onResizeStart={onInteraction}
            droppingItem={{ i: 'drop-item', w: dragItem?.w || 2, h: dragItem?.h || 2 }}
            onDrop={onDrop}
          >
            {zones.map((zone) => (
              <div key={zone.id}>
                <ZoneCard
                  isView={false}
                  zone={zone}
                  onEdit={() => openZoneEdit(zone)}
                  onDelete={() => removeZoneFromCurrentFloor(zone.id)}
                />
              </div>
            ))}
          </ReactGridLayout>
        ) : (
          <>
            {/*// @ts-ignore*/}
            <ReactGridLayout
              className="layout h-full"
              draggableCancel=".action"
              layout={layout as unknown as Layout[]}
              width={width}
              cols={COLS}
              maxRows={ROWS}
              rowHeight={cellH}
              margin={[1, 1]}
              containerPadding={[0, 0]}
              compactType={null}
              preventCollision
              isBounded={false}
            >
              {zones.map((zone) => {
                const isActive = !!activeZones?.find((z) => z.id === zone.id);
                return (
                  <div key={zone.id}>
                    <ZoneCard
                      isActive={isActive}
                      isView={true}
                      zone={zone}
                    />
                  </div>
                );
              })}
            </ReactGridLayout>
            <svg className="pointer-events-none absolute inset-0" width="100%" height="100%">
              {visibleSegments.map(([a, b], i) => {
                const A = centers[a], B = centers[b];
                if (!A || !B) return null;
                return (
                  <g key={`${a}-${b}-${i}`}>
                    {/* corridor-first look: thicker base + dashed shadow to імітувати напрямок */}
                    <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} strokeWidth={6} stroke="rgba(0,0,0,0.12)" />
                    <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} strokeWidth={4} stroke="currentColor" />
                    <circle cx={A.x} cy={A.y} r={4} fill="currentColor" />
                    {i === visibleSegments.length - 1 && <circle cx={B.x} cy={B.y} r={6} fill="currentColor" />}
                  </g>
                );
              })}
            </svg>
          </>
        )}
      </div>
    </div>
  );
};
