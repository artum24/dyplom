import { COLS, MARGIN, PADDING, ROWS } from '@/app/(app)/builder/[facilityId]/components/FloorEditor/constants';
import ReactGridLayout, { Layout } from 'react-grid-layout';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Floor, Zone } from '@/store/builder/types';
import { ZoneCard } from '@/app/(app)/builder/[facilityId]/components/ZoneCard/ZoneCard';
import { useModal } from '@/store/modal/modal';
import { useMapBuilder } from '@/store/builder/builder';
import { cn } from '@/lib/utils/utils';
import { Cell } from '@/lib/utils/routing';

type ZoneGridProps = {
  layout: Layout[];
  onLayoutChange?: (layout: Layout[]) => void;
  onInteraction?: () => void;
  onDrop?: (layout: Layout[], item: Layout) => void;
  floor: Floor;
  zones: Zone[];
  isEditable: boolean;
  activeZones?: Zone[];
  pathCells?: Cell[];
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
                           pathCells = [],
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
  const innerH = height - PADDING[1] * 2 - MARGIN[1] * (ROWS - 1);

  const cellW = Math.max(20, innerW / COLS);
  const cellH = Math.max(20, innerH / ROWS);

  const toPx = (c: { x: number; y: number }) => ({
    x: PADDING[0] + c.x * (cellW + MARGIN[0]) + cellW / 2,
    y: PADDING[1] + c.y * (cellH) + cellH / 2,
  });

  const poly = useMemo(() => pathCells.map(toPx), [pathCells, cellW, cellH, width, height]);
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
          backgroundSize: `${cellW + MARGIN[0]}px ${cellH + MARGIN[1]}px`, // ← додали MARGIN[1]
          backgroundPosition: `0px 0px`,
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
              {poly.length >= 2 && (
                <g>
                  {/* тінь */}
                  <polyline
                    points={poly.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth={6}
                  />
                  {/* основна лінія */}
                  <polyline
                    points={poly.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none" stroke="currentColor" strokeWidth={4}
                  />
                  {/* точки початку/кінця */}
                  <circle cx={poly[0].x} cy={poly[0].y} r={4} fill="currentColor" />
                  <circle cx={poly[poly.length - 1].x} cy={poly[poly.length - 1].y} r={6} fill="currentColor" />
                </g>
              )}
            </svg>
          </>
        )}
      </div>
    </div>
  );
};
