export type RectZone = {
  id: string;
  floor_id: string;
  type?: string | null;
  x?: number | null;
  y?: number | null;
  width?: number | null;
  height?: number | null;
  name?: string | null;
  subtitle?: string | null;
};

export type ClientEdge = { from_zone_id: string; to_zone_id: string; weight?: number };

const asNum = (v: unknown, d = 0): number =>
  typeof v === 'number' && !Number.isNaN(v) ? v : Number(v ?? d) || d;

const WALKABLE_TYPES = new Set([
  'corridor', 'hall', 'transition', 'passage', 'walkway',
  'перехід', 'коридор',
]);
const PORTAL_TYPES = new Set(['stairs', 'stair', 'elevator', 'lift', 'сходи', 'ліфт']);
const ENTRY_TYPES = new Set(['entrance', 'reception', 'lobby', 'вхід', 'реєстратура']);

const normType = (t?: string | null) => String(t || '').trim().toLowerCase();
const isWalkable = (t?: string | null) => WALKABLE_TYPES.has(normType(t)) || PORTAL_TYPES.has(normType(t)) || ENTRY_TYPES.has(normType(t));
const isPortal = (t?: string | null) => PORTAL_TYPES.has(normType(t));
const isEntry = (t?: string | null) => ENTRY_TYPES.has(normType(t));
const isRoomLike = (t?: string | null) => !isWalkable(t);

export function buildImplicitEdges(zones: RectZone[]): ClientEdge[] {
  if (!zones?.length) return [];
  type Z = Required<Pick<RectZone, 'id' | 'floor_id'>> & Partial<RectZone>;
  const ZS = zones as Z[];

  const center = (z: Z) => ({ x: asNum(z.x), y: asNum(z.y), w: asNum(z.width, 1), h: asNum(z.height, 1) });

  const touchHoriz = (a: Z, b: Z) => {
    const A = center(a), B = center(b);
    const aR = A.x + A.w, bR = B.x + B.w;
    const shareY = Math.max(0, Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y)) >= 1;
    return shareY && (aR === B.x || bR === A.x);
  };
  const touchVert = (a: Z, b: Z) => {
    const A = center(a), B = center(b);
    const aB = A.y + A.h, bB = B.y + B.h;
    const shareX = Math.max(0, Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x)) >= 1;
    return shareX && (aB === B.y || bB === A.y);
  };

  const manhattan = (a: Z, b: Z) => {
    const A = center(a), B = center(b);
    const cxA = A.x + A.w / 2, cyA = A.y + A.h / 2;
    const cxB = B.x + B.w / 2, cyB = B.y + B.h / 2;
    return Math.abs(cxA - cxB) + Math.abs(cyA - cyB);
  };

  const edges: ClientEdge[] = [];
  const byFloor: Record<string, Z[]> = {};
  for (const z of ZS) (byFloor[z.floor_id] ||= []).push(z);

  for (const floorId of Object.keys(byFloor)) {
    const arr = byFloor[floorId];
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a = arr[i], b = arr[j];
        if (!(touchHoriz(a, b) || touchVert(a, b))) continue;

        const aIsRoom = isRoomLike(a.type);
        const bIsRoom = isRoomLike(b.type);
        if (aIsRoom && bIsRoom) continue;

        const w = Math.max(1, manhattan(a, b));
        edges.push({ from_zone_id: String(a.id), to_zone_id: String(b.id), weight: w });
        edges.push({ from_zone_id: String(b.id), to_zone_id: String(a.id), weight: w });
      }
    }
  }

  const portals = ZS.filter((z) => isPortal(z.type));
  const keyOf = (z: Z) => String(z.subtitle || z.name || '').trim().toLowerCase();
  const groups: Record<string, Z[]> = {};
  for (const p of portals) (groups[keyOf(p)] ||= []).push(p);

  for (const key of Object.keys(groups)) {
    const list = groups[key];
    for (const a of list) {
      for (const b of list) {
        if (a === b || a.floor_id === b.floor_id) continue;
        const w = manhattan(a, b) + 10; // floor-change penalty
        edges.push({ from_zone_id: String(a.id), to_zone_id: String(b.id), weight: w });
        edges.push({ from_zone_id: String(b.id), to_zone_id: String(a.id), weight: w });
      }
    }
  }

  for (const a of portals) {
    let best: { id: string; w: number } | null = null;
    for (const b of portals) {
      if (a === b || a.floor_id === b.floor_id) continue;
      const w = manhattan(a, b) + 10;
      if (!best || w < best.w) best = { id: String(b.id), w };
    }
    if (best) {
      edges.push({ from_zone_id: String(a.id), to_zone_id: best.id, weight: best.w });
      edges.push({ from_zone_id: best.id, to_zone_id: String(a.id), weight: best.w });
    }
  }

  return edges;
}

export function buildPathClient(startId: string, targetId: string, zones: RectZone[]): string[] {
  const edges = buildImplicitEdges(zones);
  if (!startId || !targetId) return [];
  if (startId === targetId) return [startId];

  const typeBy = new Map<string, string>();
  const centers = new Map<string, { x: number; y: number }>();
  for (const z of zones) {
    const id = String(z.id);
    typeBy.set(id, normType(z.type));
    const x = asNum(z.x), y = asNum(z.y), w = asNum(z.width, 1), h = asNum(z.height, 1);
    centers.set(id, { x: x + w / 2, y: y + h / 2 });
  }

  const adj = new Map<string, Array<{ to: string; w: number }>>();
  const add = (a: string, b: string, w: number) => {
    if (!adj.has(a)) adj.set(a, []);
    adj.get(a)!.push({ to: b, w });
  };
  for (const e of edges) add(e.from_zone_id, e.to_zone_id, e.weight ?? 1);


  const TURN_PENALTY = 2;
  const segDir = (a: string, b: string): 'h' | 'v' | 'p' => {
    const A = centers.get(a);
    const B = centers.get(b);
    if (!A || !B) return 'p';
    const dx = Math.abs(A.x - B.x), dy = Math.abs(A.y - B.y);
    if (dx > dy) return 'h';
    if (dy > dx) return 'v';
    return 'p';
  };

  const moveCost = (from: string, to: string, prevNode: string | null): number => {
// base edge cost
    const base = (adj.get(from) || []).find((x) => x.to === to)?.w ?? 1;


    const tFrom = typeBy.get(from);
    const tTo = typeBy.get(to);


    let penalty = 0;
    if (isPortal(tTo)) penalty += 10;


    const toIsRoom = isRoomLike(tTo);
    const fromIsRoom = isRoomLike(tFrom);
    if (toIsRoom && to !== String(targetId)) penalty += 1000;
    if (fromIsRoom && from !== String(startId)) penalty += 800;


    if (!isWalkable(tTo)) penalty += 5;

    if (prevNode) {
      const d1 = segDir(prevNode, from);
      const d2 = segDir(from, to);
      if ((d1 === 'h' && d2 === 'v') || (d1 === 'v' && d2 === 'h')) penalty += TURN_PENALTY;
    }

    return base + penalty;
  };

  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const Q = new Set<string>([startId, targetId, ...Array.from(adj.keys())]);
  Q.forEach((n) => {
    dist.set(n, Number.POSITIVE_INFINITY);
    prev.set(n, null);
  });
  dist.set(startId, 0);


  while (Q.size) {
    let u: string | null = null;
    let best = Number.POSITIVE_INFINITY;
    // @ts-ignore
    for (const n of Q) {
      const d = dist.get(n)!;
      if (d < best) {
        best = d;
        u = n;
      }
    }
    if (u === null) break;
    Q.delete(u);
    if (u === targetId) break;
    for (const { to } of adj.get(u) || []) {
      if (!Q.has(to)) continue;
      const alt = dist.get(u)! + moveCost(u, to, prev.get(u) || null);
      if (alt < dist.get(to)!) {
        dist.set(to, alt);
        prev.set(to, u);
      }
    }
  }

  const path: string[] = [];
  let cur: string | null = targetId;
  if ((prev.get(cur!) !== null) || cur === startId) {
    while (cur) {
      path.unshift(cur);
      cur = prev.get(cur) || null;
    }
  }
  return path;
}

export function defaultStartZoneId(zones: RectZone[]): string | null {
  const entry = zones.find((z) => isEntry(z.type));
  if (entry) return String(entry.id);
  const firstFloor = zones[0]?.floor_id;
  return zones.find((z) => z.floor_id === firstFloor)?.id ?? zones[0]?.id ?? null;
}