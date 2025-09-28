import AppHeader from '@/components/AppHeader/AppHeader';
import AuthGate from '@/components/AuthGate/AuthGate';
import DoctorsClient from '@/app/(app)/facility/[id]/doctors/components/DoctorsClient/DoctorsClient';

export default async function DoctorsPage({ params }: { params: { id: string } }) {
  return (
    <>
      <AppHeader />
      <AuthGate>
        <DoctorsClient facilityId={params.id} />
      </AuthGate>
    </>
  );
}
