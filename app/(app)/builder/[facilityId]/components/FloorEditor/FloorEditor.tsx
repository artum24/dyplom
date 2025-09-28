'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import ReactGridLayout, { Layout } from 'react-grid-layout';
import { v4 as uuid } from 'uuid';
import { useMapBuilder } from '../../../../../../store/builder/builder';
import ZoneCard from '@/app/(app)/builder/[facilityId]/components/ZoneCard/ZoneCard';
import { useModal } from '../../../../../../store/modal/modal';

const CELL = 20;
const COLS = 36;
const ROWS = 30;
const MARGIN: [number, number] = [8, 8];
const PADDING: [number, number] = [12, 12];

const clamp = (item: Layout) => {
  const w = Math.max(1, Math.min(item.w, COLS));
  const h = Math.max(1, Math.min(item.h, ROWS));
  const x = Math.max(0, Math.min(item.x, COLS - w));
  const y = Math.max(0, Math.min(item.y, ROWS - h));
  return { ...item, x, y, w, h };
};

export default function FloorEditor() {
  const {
    floors,
    selectedFloorIndex,
    addZoneToCurrentFloor,
    updateZoneInCurrentFloor,
    removeZoneFromCurrentFloor,
    selectedZoneId,
    setSelectedZoneId,
  } = useMapBuilder();
  const { openZoneEdit } = useModal();
  const floor = selectedFloorIndex != null ? floors[selectedFloorIndex] : null;
  const zones = floor?.zones || [];

  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1200);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => setWidth(el.clientWidth));
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const layout = useMemo<Layout[]>(() => {
    return zones.map((z) => ({
      i: z.id,
      x: Math.max(0, Math.floor(z.x / CELL)),
      y: Math.max(0, Math.floor(z.y / CELL)),
      w: Math.max(1, Math.ceil(z.width / CELL)),
      h: Math.max(1, Math.ceil(z.height / CELL)),
      isDraggable: true,
      isResizable: true,
    }));
  }, [zones]);

  const persistOne = (raw: Layout) => {
    const fixed = clamp(raw);
    const z = zones.find((zz) => zz.id === fixed.i);
    if (!z) return;
    const nx = fixed.x * CELL,
      ny = fixed.y * CELL;
    const nw = fixed.w * CELL,
      nh = fixed.h * CELL;
    if (z.x === nx && z.y === ny && z.width === nw && z.height === nh) return;
    updateZoneInCurrentFloor({
      ...z,
      x: nx,
      y: ny,
      width: nw,
      height: nh,
    });
  };

  const handleLayoutChange = (next: Layout[]) => {
    if (!next || !next.length) return;
    for (const it of next) {
      persistOne(it);
    }
  };

  if (!floor) return <div className="p-6 text-gray-400">Оберіть поверх</div>;

  return (
    <div
      ref={ref}
      className="relative mx-auto h-[640px] w-full overflow-hidden rounded-md border bg-gray-50"
      onDoubleClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const gx = Math.floor((e.clientX - rect.left) / CELL);
        const gy = Math.floor((e.clientY - rect.top) / CELL);
        addZoneToCurrentFloor({
          id: uuid(),
          floor_id: floor.id,
          type: 'room',
          x: gx * CELL,
          y: gy * CELL,
          width: 5 * CELL,
          height: 5 * CELL,
          color: '#2ECC71',
          subtitle: 'Новий блок',
        });
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/x-zone');
        if (!data) return;
        const preset = JSON.parse(data);
        const rect = e.currentTarget.getBoundingClientRect();
        const gx = Math.floor((e.clientX - rect.left) / CELL);
        const gy = Math.floor((e.clientY - rect.top) / CELL);
        addZoneToCurrentFloor({
          id: uuid(),
          floor_id: floor.id,
          type: preset.type,
          x: gx * CELL,
          y: gy * CELL,
          width: Math.max(1, preset.w) * CELL,
          height: Math.max(1, preset.h) * CELL,
          color: preset.color,
          subtitle: preset.label,
        });
      }}
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,.05) 1px, transparent 1px),
          linear-gradient(to right, rgba(0,0,0,.09) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,.09) 1px, transparent 1px)
        `,
        backgroundSize: `
          ${CELL}px ${CELL}px,
          ${CELL}px ${CELL}px,
          ${CELL * 5}px ${CELL * 5}px,
          ${CELL * 5}px ${CELL * 5}px
        `,
      }}
    >
      <ReactGridLayout
        className="layout"
        layout={layout}
        cols={COLS}
        rowHeight={CELL}
        width={width}
        margin={MARGIN}
        containerPadding={PADDING}
        compactType={null}
        preventCollision
        isBounded
        maxRows={ROWS}
        isDraggable
        isResizable
        draggableCancel=".action"
        onLayoutChange={handleLayoutChange}
        onDragStop={(_, item) => persistOne(item)}
        onResizeStop={(_, item) => persistOne(item)}
      >
        {zones.map((z) => (
          <div key={z.id}>
            <ZoneCard
              zone={z}
              isSelected={z.id === selectedZoneId}
              onSelect={() => setSelectedZoneId(z.id)}
              onEdit={() => openZoneEdit(z)}
              onDelete={() => removeZoneFromCurrentFloor(z.id)}
            />
          </div>
        ))}
      </ReactGridLayout>
    </div>
  );
}
