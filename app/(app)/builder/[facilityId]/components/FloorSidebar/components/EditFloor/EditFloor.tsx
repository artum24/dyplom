'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog/Dialog';
import { Button } from '@/components/ui/Button/Button';
import { Label } from '@/components/ui/Label/Label';
import { Input } from '@/components/ui/Input/Input';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { useFloors } from '@/hooks/useFloors';
import { Floor } from '@/store/builder/types';
import { toast } from 'sonner';

export const EditFloor = ({ facilityId, floor }: { facilityId: string; floor: Floor }) => {
  const { renameFloor } = useFloors(facilityId);

  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const onSubmit = async () => {
    try {
      setIsLoading(true);
      await renameFloor(floor.id, name);
      setIsOpen(false);
      setName('');
      router.refresh();
      toast('Поверх успішно змінено!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogTrigger onClick={() => setIsOpen(true)}>
        <Button className="hover:bg-transparent" variant="ghost">
          <Pencil width={16} height={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Зміна назви поверху</DialogTitle>
          <DialogDescription>Вкажіть нову назву для - поверху {floor.name}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label>Назва</Label>
          <Input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Назва поверху"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Відмінити
          </Button>
          <Button
            loading={isLoading}
            type="submit"
            disabled={!name.length || isLoading}
            onClick={onSubmit}
          >
            {isLoading ? 'Збереження...' : 'Зберегти'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
