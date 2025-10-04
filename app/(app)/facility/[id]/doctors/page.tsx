import DoctorsClient from '@/app/(app)/facility/[id]/doctors/components/DoctorsClient/DoctorsClient';

export default async function DoctorsPage({ params }: { params: { id: string } }) {
  return <DoctorsClient facilityId={params.id} />;
}
