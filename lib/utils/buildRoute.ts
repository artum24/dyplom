import { Zone } from '@/store/builder/types';
import { aStarRoute, Cell, centerCellOf, erodeOnce } from '@/lib/utils/multifloor';
import { useViewClinic } from '@/store/viewClinic/viewClinic';

export function doorCellTowardCorridor(
  zone: Zone,
  toward: Cell,
  corridor: boolean[][],
): Cell | null {
  const rows = corridor.length, cols = corridor[0]?.length ?? 0;
  const x0 = Math.floor(zone.x), y0 = Math.floor(zone.y);
  const x1 = Math.ceil(zone.x + zone.width) - 1;
  const y1 = Math.ceil(zone.y + zone.height) - 1;

  const inCorr = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < cols && y < rows && corridor[y][x];

  const candidates: Cell[] = [];

  for (let y = y0; y <= y1; y++) {
    if (inCorr(x0 - 1, y)) candidates.push({ x: x0 - 1, y });
    if (inCorr(x1 + 1, y)) candidates.push({ x: x1 + 1, y });
  }
  for (let x = x0; x <= x1; x++) {
    if (inCorr(x, y0 - 1)) candidates.push({ x, y: y0 - 1 });
    if (inCorr(x, y1 + 1)) candidates.push({ x, y: y1 + 1 });
  }

  if (!candidates.length) {
    for (let r = 2; r <= 3 && !candidates.length; r++) {
      for (let y = y0; y <= y1; y++) {
        if (inCorr(x0 - r, y)) candidates.push({ x: x0 - r, y });
        if (inCorr(x1 + r, y)) candidates.push({ x: x1 + r, y });
      }
      for (let x = x0; x <= x1; x++) {
        if (inCorr(x, y0 - r)) candidates.push({ x, y: y0 - r });
        if (inCorr(x, y1 + r)) candidates.push({ x, y: y1 + r });
      }
    }
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) =>
    (Math.abs(a.x - toward.x) + Math.abs(a.y - toward.y)) -
    (Math.abs(b.x - toward.x) + Math.abs(b.y - toward.y)),
  );
  return candidates[0];
}

export function buildRouteSingleFloorCorridor(
  floor: string, from: Zone, to: Zone,
): Cell[] {
  const floorsCorridor = useViewClinic.getState().floorsCorridor;
  const corridor = floorsCorridor[floor];
  const occWalls = corridor.map(r => r.map(v => !v));
  const tHint = centerCellOf(to);
  const sHint = centerCellOf(from);
  const sDoor = doorCellTowardCorridor(from, tHint, corridor);
  const tDoor = doorCellTowardCorridor(to, sHint, corridor);

  if (!sDoor || !tDoor) return [];

  let path = aStarRoute(occWalls, sDoor, tDoor, 0.25);
  if (!path.length) {
    const eroded = erodeOnce(occWalls);
    path = aStarRoute(eroded, sDoor, tDoor, 0.25);
  }
  return path;
}