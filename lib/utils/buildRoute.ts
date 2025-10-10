import { Zone } from '@/store/builder/types';
import { aStarRoute, Cell, centerCellOf, erodeOnce, makeEmptyMask } from '@/lib/utils/multifloor';
import { COLS, ROWS } from '@/app/(app)/builder/[facilityId]/components/FloorEditor/constants';

function buildBlockedMask(zonesOnFloor: Zone[]): boolean[][] {
  const blocked = makeEmptyMask();
  for (const z of zonesOnFloor) {
    // if (NON_BLOCKING.has(norm(z.type))) continue;
    const x0 = Math.max(0, Math.floor(z.x));
    const y0 = Math.max(0, Math.floor(z.y));
    const x1 = Math.min(COLS, Math.ceil(z.x + z.width));
    const y1 = Math.min(ROWS, Math.ceil(z.y + z.height));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) blocked[y][x] = true;
  }
  return blocked;
}

export function markOutdoorWithClosures(blocked: boolean[][], closures?: boolean[][]): boolean[][] {
  const out = makeEmptyMask();
  const q: Cell[] = [];
  const isClosed = (x: number, y: number) => !!closures?.[y]?.[x];
  const canStart = (x: number, y: number) => !blocked[y][x] && !isClosed(x, y);

  for (let x = 0; x < COLS; x++) {
    if (canStart(x, 0)) {
      out[0][x] = true;
      q.push({ x, y: 0 });
    }
    if (canStart(x, ROWS - 1)) {
      out[ROWS - 1][x] = true;
      q.push({ x, y: ROWS - 1 });
    }
  }
  for (let y = 0; y < ROWS; y++) {
    if (canStart(0, y)) {
      out[y][0] = true;
      q.push({ x: 0, y });
    }
    if (canStart(COLS - 1, y)) {
      out[y][COLS - 1] = true;
      q.push({ x: COLS - 1, y });
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
  while (q.length) {
    const { x, y } = q.shift()!;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      if (blocked[ny][nx] || out[ny][nx] || isClosed(nx, ny)) continue;
      out[ny][nx] = true;
      q.push({ x: nx, y: ny });
    }
  }
  return out;
}

export function buildCorridorMask(blocked: boolean[][], outdoor: boolean[][], closures?: boolean[][]): boolean[][] {
  const corridor = makeEmptyMask();
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const closed = !!closures?.[y]?.[x];
    corridor[y][x] = !blocked[y][x] && !outdoor[y][x] && !closed;
  }
  return corridor;
}

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
  zonesOnFloor: Zone[], from: Zone, to: Zone,
): Cell[] {
  const blocked = buildBlockedMask(zonesOnFloor);
  const outdoor = markOutdoorWithClosures(blocked);
  const corridor = buildCorridorMask(blocked, outdoor);
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