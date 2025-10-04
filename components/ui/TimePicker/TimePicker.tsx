'use client';

import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { Label } from '@/components/ui/Label/Label';
import { Input } from '@/components/ui/Input/Input';
import { Minus } from 'lucide-react';
import { Zone } from '@/store/builder/types';

type CalendarProps = {
  from?: string;
  to?: string;
  setValue: Dispatch<SetStateAction<Zone | null>>;
};

export function Calendar({ from, to, setValue }: CalendarProps) {
  return (
    <div className="flex flex-col">
      <Label htmlFor="time-picker" className="px-1">
        Робочий час
      </Label>
      <div className="flex justify-between items-center gap-3">
        <Input
          value={from}
          onChange={(e) =>
            setValue((prev) => ({ ...prev, time_from: e.target.value as string }) as Zone)
          }
          type="time"
          id="time-picker"
          step="1"
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
        <Minus height={40} width={40} />
        <Input
          value={to}
          onChange={(e) =>
            setValue((prev) => ({ ...prev, time_to: e.target.value as string }) as Zone)
          }
          type="time"
          id="time-picker"
          step="1"
          className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  );
}
