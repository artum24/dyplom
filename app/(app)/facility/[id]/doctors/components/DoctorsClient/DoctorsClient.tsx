'use client';
import { useEffect, useState } from 'react';
import { createDoctor, listDoctors } from '@/lib/data/doctors';
import { Doctor } from '../../../../../../../store/builder/types';

export default function DoctorsClient({ facilityId }: { facilityId: string }) {
  const [items, setItems] = useState<Doctor[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    listDoctors(facilityId).then(setItems);
  }, [facilityId]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-xl font-semibold">Лікарі</h1>
      <form
        className="mb-4 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim()) return;
          await createDoctor({ facility_id: facilityId, full_name: name.trim() });
          setName('');
          setItems(await listDoctors(facilityId));
        }}
      >
        <input
          className="flex-1 rounded border px-3 py-2"
          placeholder="ПІБ"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Додати</button>
      </form>

      <ul className="space-y-2">
        {items.map((d) => (
          <li key={d.id} className="rounded border bg-white p-3">
            {d.full_name} {d.specialty && `• ${d.specialty}`}
          </li>
        ))}
      </ul>
    </main>
  );
}
