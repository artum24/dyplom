const toMinutes = (t: string) => {
  const [h, m, s] = t.split(':').map(Number);
  return h * 60 + m + Math.floor((s ?? 0) / 60);
};

export function isOpenSingleRange(time_from: string, time_to: string, now = new Date()): boolean {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const fromMin = toMinutes(time_from);
  const toMin = toMinutes(time_to);

  if (fromMin === toMin) return false;

  if (fromMin < toMin) {
    return nowMin >= fromMin && nowMin < toMin;
  } else {
    return nowMin >= fromMin || nowMin < toMin;
  }
}