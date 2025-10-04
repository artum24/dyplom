'use client';

import { useEffect, useMemo, useState } from 'react';
import { listDoctors } from '@/lib/data/doctors';
import { Doctor } from '../../../../../../../store/builder/types';
import { AddDoctorDialog } from '@/app/(app)/facility/[id]/doctors/components/AddDoctor/AddDoctor';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Label } from '@/components/ui/Label/Label';
import { toast } from 'sonner';
import { Filter, Mail, Phone, Stethoscope, User2, X } from 'lucide-react';
import { RemoveDoctorDialog } from '@/app/(app)/facility/[id]/doctors/components/RemoveDoctor/RemoveDoctor';
import { EditDoctorDialog } from '@/app/(app)/facility/[id]/doctors/components/EditDoctor/EditDoctor';

export default function DoctorsClient({ facilityId }: { facilityId: string }) {
  const [items, setItems] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState<string>('all');

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await listDoctors(facilityId);
      setItems(data || []);
    } catch (e) {
      console.error(e);
      toast.error('Не вдалося завантажити список лікарів');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [facilityId]);

  const specialties = useMemo(() => {
    const s = new Set(
      (items || [])
        .map((d) => (d.specialty || '').trim())
        .filter(Boolean)
        .map((s) => s.toLowerCase())
    );
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const spec = specialty.toLowerCase();

    let list = items;

    if (q) {
      list = list.filter((d) => {
        const name = (d.full_name || '').toLowerCase();
        const sp = (d.specialty || '').toLowerCase();
        const phone = (d.phone || '').toLowerCase();
        const email = (d.email || '').toLowerCase();
        return name.includes(q) || sp.includes(q) || phone.includes(q) || email.includes(q);
      });
    }

    if (spec && spec !== 'all') {
      list = list.filter((d) => (d.specialty || '').toLowerCase() === spec);
    }

    return list;
  }, [items, query, specialty]);

  const clearFilters = () => {
    setQuery('');
    setSpecialty('all');
  };

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Лікарі</h1>
          <p className="text-sm text-muted-foreground">
            Усього: {items.length}
            {filtered.length !== items.length ? ` • Показано: ${filtered.length}` : ''}
          </p>
        </div>

        <AddDoctorDialog
          facilityId={facilityId}
          updateDoctors={(next: Doctor[]) => setItems(next)}
        />
      </div>

      <div className="mb-4 grid grid-cols-6 gap-3">
        <div className="sm:col-span-3">
          <Label htmlFor="doctor-search" className="sr-only">
            Пошук
          </Label>
          <div className="relative">
            <Input
              id="doctor-search"
              placeholder="Пошук за іменем, спеціальністю, телефоном або email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                onClick={() => setQuery('')}
                aria-label="Очистити пошук"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        <div className="sm:col-span-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="all">Усі спеціальності</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {capitalize(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <ul className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="rounded border bg-white p-4">
              <div className="h-4 w-1/3 animate-pulse rounded bg-muted mb-2" />
              <div className="h-3 w-1/4 animate-pulse rounded bg-muted mb-3" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <EmptyState
          title="Поки що немає жодного лікаря"
          description="Додайте першого лікаря, щоб розпочати."
          action={
            <AddDoctorDialog
              facilityId={facilityId}
              updateDoctors={(next: Doctor[]) => setItems(next)}
            />
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Нічого не знайдено"
          description="Спробуйте змінити параметри пошуку або фільтри."
          action={
            <Button variant="outline" onClick={clearFilters}>
              Скинути фільтри
            </Button>
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((d) => (
            <li
              key={d.id}
              className="rounded-lg border bg-white p-4 shadow-sm transition hover:shadow"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                <div>
                  <div className="flex items-center gap-2 text-lg font-medium">
                    <User2 className="size-5 text-muted-foreground" />
                    <span>{d.full_name}</span>
                    {d.specialty && (
                      <span className="ml-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
                        <Stethoscope className="size-3.5" />
                        {d.specialty}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    {d.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="size-4" />
                        <a className="hover:underline" href={`tel:${d.phone}`}>
                          {formatPhone(d.phone)}
                        </a>
                      </span>
                    )}
                    {d.email && (
                      <span className="inline-flex items-center gap-1">
                        <Mail className="size-4" />
                        <a className="hover:underline" href={`mailto:${d.email}`}>
                          {d.email}
                        </a>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RemoveDoctorDialog
                    doctor={d}
                    doctors={items}
                    updateDoctors={(next: Doctor[]) => setItems(next)}
                  />
                  <EditDoctorDialog
                    facilityId={facilityId}
                    doctors={items}
                    doctor={d}
                    onSuccess={(next: Doctor[]) => setItems(next)}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

// ——— Reusable empty state ———
function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-white p-10 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

// ——— Utils ———
function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatPhone(raw?: string) {
  if (!raw) return '';
  // очікуємо +380XXXXXXXXX → +380 XX XXX XX XX
  const digits = raw.replace(/[^\d+]/g, '');
  const m = digits.match(/^\+?(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (m) return `+${m[1]} ${m[2]} ${m[3]} ${m[4]} ${m[5]}`;
  return raw;
}
