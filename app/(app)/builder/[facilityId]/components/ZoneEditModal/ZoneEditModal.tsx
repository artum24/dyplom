'use client';

import { useEffect, useState } from 'react';
import { listDoctors } from '@/lib/data/doctors';
import { getZoneDoctorIds, setZoneDoctors, upsertZone } from '@/lib/data/zones';
import { useModal } from '../../../../../../store/modal/modal';
import { useMapBuilder } from '../../../../../../store/builder/builder';
import { Doctor, Zone, ZoneType } from '../../../../../../store/builder/types';

const COLORS = [
  '#F26A3D',
  '#2F6EA5',
  '#28B482',
  '#6E63D9',
  '#E24A44',
  '#E4C02A',
  '#87929B',
  '#E67E22',
  '#3498DB',
  '#1ABC9C',
];
const TYPE_OPTIONS: { value: ZoneType; label: string }[] = [
  { value: 'room', label: 'Кабінет' },
  { value: 'corridor', label: 'Коридор' },
  { value: 'ward', label: 'Палата' },
  { value: 'operating', label: 'Операційна' },
  { value: 'diagnostics', label: 'Діагностика' },
  { value: 'isolation', label: 'Ізолятор' },
  { value: 'reception', label: 'Реєстратура' },
  { value: 'toilet', label: 'Туалет' },
];

export default function ZoneEditModal({ facilityId }: { facilityId: string }) {
  const { isZoneEditOpen, zoneForEdit, closeZoneEdit } = useModal();
  const { floors, selectedFloorIndex, updateZoneInCurrentFloor } = useMapBuilder();

  const [local, setLocal] = useState<Zone | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const floor = selectedFloorIndex != null ? floors[selectedFloorIndex] : null;
  if (!isZoneEditOpen || !zoneForEdit || !floor) return null;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const [docs, linkedIds] = await Promise.all([
          listDoctors(facilityId),
          getZoneDoctorIds(zoneForEdit.id),
        ]);
        if (!active) return;
        setDoctors(docs);
        setSelectedDoctors(linkedIds);
        setLocal(zoneForEdit);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [facilityId, zoneForEdit]);

  const isCorridor = local?.type === 'corridor';

  const onSave = async () => {
    if (!local) return;
    try {
      setLoading(true);
      await upsertZone(local);

      await setZoneDoctors(local.id, isCorridor ? [] : selectedDoctors); // NEW
      updateZoneInCurrentFloor(local);
      closeZoneEdit();
    } catch (e) {
      console.error(e);
      alert('Помилка збереження');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-lg font-semibold">Редагування зони</h3>
          <button className="rounded border px-2 py-1 text-sm" onClick={closeZoneEdit}>
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-auto px-4 py-4">
          {loading && <div className="text-sm text-gray-500">Завантаження…</div>}

          {/* Тип */}
          <div>
            <label className="mb-1 block text-sm font-medium">Тип</label>
            <select
              className="w-full rounded border px-2 py-1.5 text-sm"
              value={local?.type}
              onChange={(e) => setLocal({ ...local!, type: e.target.value as ZoneType })}
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Назва */}
          <div>
            <label className="mb-1 block text-sm font-medium">Назва / підзаголовок</label>
            <input
              className="w-full rounded border px-2 py-1.5 text-sm"
              value={local?.subtitle ?? ''}
              onChange={(e) => setLocal({ ...local!, subtitle: e.target.value })}
              placeholder="Напр., Кабінет педіатра"
            />
          </div>

          {/* Опис */}
          <div>
            <label className="mb-1 block text-sm font-medium">Опис</label>
            <textarea
              rows={3}
              className="w-full rounded border px-2 py-1.5 text-sm"
              value={local?.description ?? ''}
              onChange={(e) => setLocal({ ...local!, description: e.target.value })}
              placeholder="Додатково: обладнання, примітки…"
            />
          </div>

          {/* Колір */}
          <div>
            <label className="mb-2 block text-sm font-medium">Колір</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={`h-7 w-7 rounded border ${local?.color === c ? 'ring-2 ring-blue-600' : ''}`}
                  style={{ background: c }}
                  onClick={() => setLocal({ ...local!, color: c })}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Опції для коридору */}
          {isCorridor && (
            <div className="rounded border p-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setLocal({ ...local!, x: 0, width: 36 * 20 });
                    }
                  }}
                />
                Зайняти всю ширину
              </label>
            </div>
          )}

          {/* Лікарі (лише не-коридор) */}
          {!isCorridor && (
            <div>
              <label className="mb-1 block text-sm font-medium">Лікарі</label>
              <div className="grid grid-cols-2 gap-2">
                {doctors.map((d) => {
                  const checked = selectedDoctors.includes(d.id);
                  return (
                    <label
                      key={d.id}
                      className="flex items-center gap-2 rounded border p-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setSelectedDoctors((prev) =>
                            e.target.checked ? [...prev, d.id] : prev.filter((x) => x !== d.id)
                          )
                        }
                      />
                      <span className="truncate">
                        {d.full_name}
                        {d.specialty ? ` • ${d.specialty}` : ''}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-4 py-3">
          <button
            className="rounded border px-3 py-1.5 text-sm"
            onClick={closeZoneEdit}
            disabled={loading}
          >
            Скасувати
          </button>
          <button
            className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-60"
            onClick={onSave}
            disabled={loading}
          >
            Зберегти
          </button>
        </div>
      </div>
    </div>
  );
}
