import { Zone } from '@/store/builder/types';
import { Cell, makeEmptyMask } from '@/lib/utils/multifloor';
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


export const buildCorridor = (zonesOnFloor: Zone[]) => {
  const blocked = buildBlockedMask(zonesOnFloor);
  const outdoor = markOutdoorWithClosures(blocked);
  return buildCorridorMask(blocked, outdoor);
};