'use client';

import { Zone } from '@/store/builder/types';
import * as React from 'react';
import { useState } from 'react';
import { Clock, LogOut, Minus, SquarePen, Trash2, Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge/Badge';

interface ZoneCardProps {
  zone: Zone;
  onEdit?: () => void;
  onDelete?: () => void;
  isView: boolean;
  isActive?: boolean;
}

function getZoneTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    room: 'Кабінет',
    ward: 'Палата',
    operating: 'Операційна',
    diagnostics: 'Діагностика',
    isolation: 'Ізолятор',
    toilet: 'Санвузол',
    reception: 'Рецепція',
  };
  return typeMap[type] || type;
}

export const ZoneCard = ({ isActive, zone, onEdit, onDelete, isView }: ZoneCardProps) => {
  const [showActions, setShowActions] = useState(false);

  const baseColor = zone.color || '#F56A2C';

  const zoneLabel = zone.subtitle || getZoneTypeLabel(zone.type);
  const hasDoctors = zone.zone_doctors && zone.zone_doctors.length > 0;
  const hasWorkHours = zone.time_from && zone.time_to;
  const isExit = zone.type === 'exit';
  const doctors = zone?.zone_doctors || [];
  return (
    <div
      className="absolute inset-0 select-none overflow-visible"
      onMouseEnter={() => !isView && setShowActions(true)}
      onMouseLeave={() => !isView && setShowActions(false)}
    >
      <div
        className="relative flex h-full w-full flex-col p-2 text-black z-[1] overflow-hidden rounded-xl"
        style={{
          backgroundColor: isActive ? baseColor + '99' : baseColor + '44',
          borderColor: isActive ? baseColor : baseColor + '88',
          borderWidth: 1,
        }}
      >
        <div className="flex justify-between items-start mb-1">
          {zone.type === 'exit' ? (
            <div className="flex items-center">
              <LogOut className="mr-1" size={16} />
              <span className="font-semibold">Вихід</span>
            </div>
          ) : (
            <div className="text-base font-semibold truncate">{zoneLabel}</div>
          )}

          {!isView && showActions && (
            <div className="flex items-center space-x-1 text-xs">
              <button
                className="action p-1 hover:bg-black/20 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                aria-label="Редагувати"
              >
                <SquarePen width={12} height={12} />
              </button>
              <button
                className="action p-1 hover:bg-black/20 rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                aria-label="Видалити"
              >
                <Trash2 width={12} height={12} />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1">
          {!isExit && hasWorkHours && (
            <div className="flex items-center text-xs gap-1 mt-1">
              <Clock size={14} />
              <span className="whitespace-nowrap">
                {zone?.time_from?.substring(0, 5)} <Minus size={10} className="inline mx-1" />{' '}
                {zone?.time_to?.substring(0, 5)}
              </span>
            </div>
          )}

          {zone.description && (
            <div className="mt-1 text-xs text-white/85 line-clamp-2 overflow-hidden">
              {zone.description}
            </div>
          )}

          <div className="flex-grow"></div>

          {hasDoctors && (
            <div className="mt-auto pt-1 overflow-hidden border-t border-white/20">
              <div className="flex items-center text-xs mb-1 gap-1">
                <Users size={14} />
                <span>
                  {zone?.zone_doctors?.length}{' '}
                  {zone?.zone_doctors?.length === 1
                    ? 'лікар'
                    : doctors.length < 5
                      ? 'лікарі'
                      : 'лікарів'}
                </span>
              </div>
              <div className="flex gap-1 flex-wrap">
                {zone?.zone_doctors?.slice(0, 3).map((doctor) => (
                  <Badge
                    key={doctor.doctor_id}
                    className="bg-white/20 border-transparent text-black text-xs"
                  >
                    {doctor.doctors.full_name}
                  </Badge>
                ))}
                {doctors.length > 3 && (
                  <Badge className="bg-white/20 border-transparent text-white text-xs">
                    +{doctors.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
