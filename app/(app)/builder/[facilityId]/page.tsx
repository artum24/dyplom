import { supabaseServer } from '@/lib/supabaseServer';
import AppHeader from '@/components/AppHeader/AppHeader';
import AuthGate from '@/components/AuthGate/AuthGate';
import Palette from './components/Palette/Palette';
import FloorEditor from '@/app/(app)/builder/[facilityId]/components/FloorEditor/FloorEditor';
import FloorSidebar from '@/app/(app)/builder/[facilityId]/components/FloorSidebar/FloorSidebar';
import ZoneEditModal from '@/app/(app)/builder/[facilityId]/components/ZoneEditModal/ZoneEditModal';

export default async function Builder({ params }: { params: { facilityId: string } }) {
  const sb = supabaseServer();
  const { data: facility } = await sb
    .from('facilities')
    .select('*')
    .eq('id', params.facilityId)
    .single();

  return (
    <>
      <AppHeader />
      <AuthGate>
        <div className="flex h-[calc(100vh-60px)]">
          <Palette />
          <div className="flex flex-1 flex-col">
            <div className="flex-1 p-4 overflow-auto">
              <h1 className="mb-4 text-xl font-semibold">{facility?.name ?? 'Заклад'}</h1>
              <FloorEditor />
            </div>
          </div>
          <FloorSidebar facilityId={params.facilityId} />
        </div>
      </AuthGate>
      <ZoneEditModal facilityId={params.facilityId} />
    </>
  );
}
