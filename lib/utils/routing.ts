import { Zone } from '@/store/builder/types';

export type Cell = { x: number; y: number };

export function pickReception(zones: Zone[]): Zone {
  return zones.find(z => z.type === 'reception') as Zone;
}
