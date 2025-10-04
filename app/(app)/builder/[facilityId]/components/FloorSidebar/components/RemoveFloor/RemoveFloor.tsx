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
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFloors } from '@/hooks/useFloors';
import { Floor } from '@/store/builder/types';
import { toast } from 'sonner';

export const RemoveFloorDialog = ({ facilityId, floor }: { facilityId: string; floor: Floor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { removeFloor } = useFloors(facilityId);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      await removeFloor(floor.id);
      toast('Поверх успішно видалено!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogTrigger>
        <Button className="hover:bg-transparent" variant="ghost" onClick={() => setIsOpen(true)}>
          <Trash2 width={16} height={16} className="text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Видалення поверху</DialogTitle>
          <DialogDescription>
            Ви впевнені що хочете видалити кімнату - {floor.name}?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Відмінити
          </Button>
          <Button loading={isLoading} type="submit" disabled={isLoading} onClick={onSubmit}>
            {isLoading ? 'Видалення...' : 'Видалити'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
