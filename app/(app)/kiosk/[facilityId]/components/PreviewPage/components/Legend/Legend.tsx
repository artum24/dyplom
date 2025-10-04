import { PRESETS } from '@/app/(app)/builder/[facilityId]/components/Palette/Palette';

export const Legend = () => {
  return (
    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-600">
      {PRESETS.map((t) => (
        <div key={t.type} className="flex items-center gap-1">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{
              background: t.color || '#e5e7eb',
            }}
          />
          {t.label}
        </div>
      ))}
    </div>
  );
};
