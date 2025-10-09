import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Dispatch, SetStateAction, useEffect, useMemo, useRef, useState } from 'react';


type DoctorLite = {
  id: string;
  full_name: string;
  specialty?: string | null;
  zone_id: string;
  floor_id: string;
  zone_subtitle?: string | null;
};


type ActionsProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  doctors?: DoctorLite[];
  onPickDoctor?: (doctorId: string) => void;
};


export const Actions = ({ query, setQuery, doctors = [], onPickDoctor }: ActionsProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);


  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as DoctorLite[];
    const scored = doctors
      .map((d) => {
        const name = d.full_name.toLowerCase();
        const spec = (d.specialty || '').toLowerCase();
        const idx = name.indexOf(q);
        const idx2 = spec.indexOf(q);
        const score = idx >= 0 ? idx : idx2 >= 0 ? idx2 + 100 : 9999;
        return { d, score };
      })
      .filter((x) => x.score < 9999)
      .sort((a, b) => a.score - b.score)
      .slice(0, 8)
      .map((x) => x.d);
    return scored;
  }, [query, doctors]);


  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);


  return (
    <section ref={containerRef} className="mx-auto px-4 py-4 relative">
      <Search className="absolute left-8 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        className="pl-9"
        placeholder="Пошук лікаря, кабінету або відділення"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => suggestions.length && setOpen(true)}
      />


      {open && suggestions.length > 0 && (
        <div className="absolute left-4 right-4 mt-2 z-20 rounded-xl border bg-white shadow">
          <ul className="max-h-72 overflow-auto py-1">
            {suggestions.map((d) => (
              <li key={d.id}>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  onClick={() => {
                    onPickDoctor?.(d.id);
                    setOpen(false);
                  }}
                >
                  <div className="text-sm font-medium leading-tight">{d.full_name}</div>
                  <div className="text-xs text-slate-500">
                    {d.specialty || '—'} {d.zone_subtitle ? `• ${d.zone_subtitle}` : ''}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};