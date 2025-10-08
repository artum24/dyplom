import Link from 'next/link';
import { supabaseServer } from '@/lib/supabaseServer';
import { AddFacility } from '@/components/AddFacility/AddFacility';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { BookUser, Hospital, PencilIcon } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';

export default async function Dashboard() {
  const sb = supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();

  const { data: facilities } = await sb
    .from('facilities')
    .select('*')
    .eq('owner', user!.id)
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Мої заклади</h1>
        <AddFacility user={user} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {facilities?.map((f) => (
          <Card key={f.id} className="gap-3 rounded border bg-white p-4 shadow-sm">
            <CardHeader className="px-0"><CardTitle>{f.name}</CardTitle></CardHeader>
            <CardFooter className="px-0 pt-3 mt-2 flex gap-2 text-sm border-t justify-between">
              <Button variant="link" size="sm">
                <PencilIcon className="h-4 w-4" />
                <Link href={`/builder/${f.id}`}>
                  Редактор
                </Link>
              </Button>
              <Button variant="link" size="sm">
                <BookUser className="h-4 w-4" />
                <Link href={`/facility/${f.id}/doctors`}>
                  Лікарі
                </Link>
              </Button>
              <Button variant="link" size="sm">
                <Hospital className="h-4 w-4" />
                <Link href={`/kiosk/${f.id}`}>
                  Перегляд
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {!facilities?.length && (
        <EmptyState
          title="Поки що немає жодного закладу"
          description="Додайте перший заклад, щоб розпочати."
          action={
            <AddFacility user={user} />
          }
        />
      )}
    </main>
  );
}
