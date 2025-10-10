import { Zone } from '@/store/builder/types';
import { COLS, ROWS } from '@/app/(app)/builder/[facilityId]/components/FloorEditor/constants';
import { buildRouteSingleFloorCorridor } from '@/lib/utils/buildRoute';
import { MinHeap } from '@/lib/utils/MinHeap';
import { pickReception } from '@/lib/utils/routing';

export type Cell = { x: number; y: number };

export function makeEmptyMask() {
  return Array.from({ length: ROWS }, () => Array<boolean>(COLS).fill(false));
}

// const NON_BLOCKING = new Set([
//   'transition',
// ]);

export function aStarRoute(
  occWalls: boolean[][],
  start: Cell, goal: Cell,
  turnPenalty = 0.25,
  maxIterations = 200_000,
): Cell[] {
  const rows = occWalls.length, cols = occWalls[0].length;
  const inB = (x: number, y: number) => x >= 0 && y >= 0 && x < cols && y < rows;
  const H = (a: Cell, b: Cell) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  if (!inB(start.x, start.y) || !inB(goal.x, goal.y) ||
    occWalls[start.y][start.x] || occWalls[goal.y][goal.x]) return [];

  const key = (c: Cell) => `${c.x},${c.y}`;
  const g = new Map<string, number>();
  const f = new Map<string, number>();
  const came = new Map<string, string>();
  const dirMap = new Map<string, [number, number] | null>();
  const closed = new Set<string>();

  const startK = key(start);
  g.set(startK, 0);
  f.set(startK, H(start, goal));
  dirMap.set(startK, null);

  const pq = new MinHeap();
  pq.push({ k: startK, f: f.get(startK)! });

  let iters = 0;
  while (pq.arr.length) {
    if (++iters > maxIterations) return [];

    const { k: ck } = pq.pop()!;
    if (closed.has(ck)) continue;
    closed.add(ck);

    const [cx, cy] = ck.split(',').map(Number);
    if (cx === goal.x && cy === goal.y) {

      const path: Cell[] = [{ x: cx, y: cy }];
      let cur = ck;
      while (came.has(cur)) {
        cur = came.get(cur)!;
        const [px, py] = cur.split(',').map(Number);
        path.unshift({ x: px, y: py });
      }
      return compressCollinear(path);
    }

    const prevDir = dirMap.get(ck);
    for (const [dx, dy] of dirs) {
      const nx = cx + dx, ny = cy + dy;
      if (!inB(nx, ny) || occWalls[ny][nx]) continue;

      const nk = `${nx},${ny}`;
      if (closed.has(nk)) continue;

      const step = 1 + (prevDir && (prevDir[0] !== dx || prevDir[1] !== dy) ? turnPenalty : 0);
      const cand = (g.get(ck) ?? Infinity) + step;
      if (cand < (g.get(nk) ?? Infinity)) {
        came.set(nk, ck);
        g.set(nk, cand);
        const ff = cand + H({ x: nx, y: ny }, goal);
        f.set(nk, ff);
        dirMap.set(nk, [dx, dy]);
        pq.push({ k: nk, f: ff });
      }
    }
  }
  return [];
}

function compressCollinear(path: Cell[]): Cell[] {
  if (path.length <= 2) return path;
  const out: Cell[] = [path[0]];
  const dir = (a: Cell, b: Cell) => ({ dx: Math.sign(b.x - a.x), dy: Math.sign(b.y - a.y) });
  let prev = dir(path[0], path[1]);
  for (let i = 1; i < path.length - 1; i++) {
    const d = dir(path[i], path[i + 1]);
    if (d.dx !== prev.dx || d.dy !== prev.dy) {
      out.push(path[i]);
      prev = d;
    }
  }
  out.push(path[path.length - 1]);
  return out;
}

const isPortal = (z: Zone) => ['stairs', 'lift'].includes(z.type);

export function centerCellOf(z: Zone): Cell {
  return { x: Math.round(z.x + z.width / 2), y: Math.round(z.y + z.height / 2) };
}

function makePortalPairs(
  startFloorPortals: Zone[],
  targetFloorPortals: Zone[],
  start: Zone,
  target: Zone,
) {
  const S = startFloorPortals, T = targetFloorPortals;
  const sC = centerCellOf(start), tC = centerCellOf(target);
  const pairs: Array<{ a: Zone; b: Zone; score: number }> = [];

  for (const a of S) for (const b of T) {
    const keyMatch = a.type === b.type;
    if (keyMatch) {
      const d1 = Math.abs(centerCellOf(a).x - sC.x) + Math.abs(centerCellOf(a).y - sC.y);
      const d2 = Math.abs(centerCellOf(b).x - tC.x) + Math.abs(centerCellOf(b).y - tC.y);
      pairs.push({ a, b, score: d1 + d2 + 20 });
    }
  }
  pairs.sort((x, y) => x.score - y.score);
  return pairs;
}

export function erodeOnce(occWalls: boolean[][]): boolean[][] {
  const rows = occWalls.length, cols = occWalls[0].length;
  const out = occWalls.map(r => r.slice());
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    if (!occWalls[y][x]) continue;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows && !occWalls[ny][nx]) {
        out[y][x] = false;
        break;
      }
    }
  }
  return out;
}

export function buildMultiFloorRoute(
  allZones: Zone[],
  targetZoneId: string,
): { byFloor: Record<string, Cell[]> } {
  const start = pickReception(allZones);
  const target = allZones.find(z => String(z.id) === String(targetZoneId));
  if (!start || !target) return { byFloor: {} };

  if (start.floor_id === target.floor_id) {
    const path = buildRouteSingleFloorCorridor(start.floor_id, start, target);
    return { byFloor: { [start.floor_id]: path } };
  }

  const S = allZones.filter(z => z.floor_id === start.floor_id && isPortal(z));
  const T = allZones.filter(z => z.floor_id === target.floor_id && isPortal(z));
  if (!S.length || !T.length) return { byFloor: {} };

  const pairs = makePortalPairs(S, T, start, target);

  let bestResult: { byFloor: Record<string, Cell[]>; total: number } | null = null;

  for (const pair of pairs) {
    const byFloor: Record<string, Cell[]> = {};

    const leg1 = buildRouteSingleFloorCorridor(
      start.floor_id, start, pair.a,
    );

    if (!leg1.length || leg1.length <= 1) continue;
    const leg2 = buildRouteSingleFloorCorridor(
      target.floor_id, pair.b, target,
    );

    if (!leg2.length || leg1.length <= 1) continue;
    byFloor[start.floor_id] = leg1;
    byFloor[target.floor_id] = leg2;

    const total = leg1.length + leg2.length + pair.score;
    if (!bestResult || total < bestResult.total) {
      bestResult = { byFloor, total };
    }
  }

  return bestResult ? { byFloor: bestResult.byFloor } : { byFloor: {} };
}