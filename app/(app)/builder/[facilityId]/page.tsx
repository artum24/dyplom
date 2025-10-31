import { supabaseServer } from '@/lib/supabaseServer';
import { Palette } from './components/Palette/Palette';
import { FloorEditor } from '@/app/(app)/builder/[facilityId]/components/FloorEditor/FloorEditor';
import { FloorSidebar } from '@/app/(app)/builder/[facilityId]/components/FloorSidebar/FloorSidebar';
import { ZoneEditModal } from '@/app/(app)/builder/[facilityId]/components/ZoneEditModal/ZoneEditModal';
import { Doctor } from '@/store/builder/types';

export default async function Builder({ params }: { params: { facilityId: string } }) {
  const sb = supabaseServer();
  const { data: facility } = await sb
    .from('facilities')
    .select('*')
    .eq('id', params.facilityId)
    .single();

  const { data: doctors } = await supabaseServer().from('doctors')
    .select('*')
    .eq('facility_id', params.facilityId)
    .order('full_name');

  return (
    <>
      <div className="flex h-[calc(100vh-60px)]">
        <Palette />
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-4">
            <FloorEditor doctors={doctors as Doctor[]} floorName={facility?.name} />
          </div>
        </div>
        <FloorSidebar facilityId={params.facilityId} />
      </div>
      <ZoneEditModal facilityId={params.facilityId} />
    </>
  );
}
