import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card/Card';
import { Route, Sparkles, SquareUserRound } from 'lucide-react';
import { Doctor, Zone } from '@/store/builder/types';
import { Button } from '@/components/ui/Button/Button';

type DoctorSidebarProps = {
  zonesOnFloor: Zone[];
  onPickDoctor?: (doctorId: string) => void;
};

export const DoctorSidebar = ({ zonesOnFloor, onPickDoctor }: DoctorSidebarProps) => {
  const doctors = zonesOnFloor.reduce((acc, zone) => {
    const zoneDoctors = zone.zone_doctors;
    zoneDoctors?.forEach((d) => {
      if (!acc.find((a) => a.id === d.doctor_id)) {
        acc.push(d.doctors);
      }
    });
    return acc;
  }, [] as Doctor[]);

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <SquareUserRound className="h-4 w-4" /> Лікарі на цьому поверсі
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 border-t">
        <div className="pt-3">
          <div className="space-y-2 max-h-[220px] overflow-auto pr-2">
            {doctors.length === 0 && (
              <div className="text-xs text-slate-500">Нічого не знайдено</div>
            )}
            {doctors.map((d) => (
              <div key={d.id} className="w-full p-2 border rounded-xl bg-white flex items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full grid place-items-center border bg-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium leading-tight">{d.full_name}</div>
                    <div className="text-xs text-slate-500">{d.specialty}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onPickDoctor?.(d.id)}>
                    <Route className="h-4 w-4 mr-1" /> Шлях
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};