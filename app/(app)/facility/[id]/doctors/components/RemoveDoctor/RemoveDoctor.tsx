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
import { useState } from 'react';
import { Doctor } from '@/store/builder/types';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

export const RemoveDoctorDialog = ({
  doctor,
  updateDoctors,
  doctors,
}: {
  doctor: Doctor;
  doctors: Doctor[];
  updateDoctors: (doctors: Doctor[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      await supabase.from('doctors').delete().eq('id', doctor.id);
      updateDoctors(doctors.filter((d) => d.id !== doctor.id));
      toast('Лікаря успішно видалено!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogTrigger>
        <Button variant="destructive" onClick={() => setIsOpen(true)}>
          Видалити
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Видалення лікаря</DialogTitle>
          <DialogDescription>
            Ви впевнені що хочете видалити лікаря - {doctor.full_name}?
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
