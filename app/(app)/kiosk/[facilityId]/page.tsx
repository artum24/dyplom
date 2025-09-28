import AppHeader from '@/components/AppHeader/AppHeader';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function Kiosk({ params }: { params: { facilityId: string } }) {
    const sb = supabaseServer();
    const { data: facility } = await sb.from('facilities').select('*').eq('id', params.facilityId).single();

    return (
        <>
            <AppHeader/>
            <main className="mx-auto max-w-[1400px] p-6">
                <h1 className="text-xl font-semibold">{facility?.name ?? 'Кіоск'}</h1>
                <div className="mt-3 rounded border bg-white p-6 text-gray-500">
                    Публічний перегляд (ізометрія) — додамо скоро
                </div>
            </main>
        </>
    );
}
