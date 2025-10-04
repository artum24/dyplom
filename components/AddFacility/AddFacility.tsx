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
import { User } from '@supabase/auth-js';
import { supabase } from '@/lib/supabase';

export const AddFacility = ({ user }: { user: User | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const onSubmit = async () => {
    try {
      setIsLoading(true);
      await supabase.from('facilities').insert({ name, owner: user?.id });
      setIsOpen(false);
      setName('');
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(value) => setIsOpen(value)}>
      <DialogTrigger onClick={() => setIsOpen(true)}>+ Новий заклад</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Додайте новий заклад</DialogTitle>
          <DialogDescription>Вкажіть назву компанії</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label>Назва</Label>
          <Input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Назва компанії"
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
            {isLoading ? 'Створення...' : 'Створити'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
