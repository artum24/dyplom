'use client';

import * as React from 'react';
import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAppForm } from '@/hooks/useFieldContext';
import { updatePasswordSchema } from '@/components/auth/update-password/validation';
import { FormInput } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';


const UpdatePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = useSupabaseClient();
  const form = useAppForm({
    defaultValues: {
      password: '',
      repeatPassword: '',
    },
    validators: {
      onSubmit: updatePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      setErrorMsg('');

      const password = value.password;

      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      if (data.user) {
        toast.success('Пароль успішно змінено!');
        await supabase.auth.signOut();
        router.push('/login');
      }
      if (error) {
        if (error.message.includes('New password should be different from the old password.')) {
          setErrorMsg('Новий пароль має відрізнятись від попереднього');
        } else {
          setErrorMsg(error.message);
        }
      }

      setLoading(false);
    },
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await form.handleSubmit();
      }}
      className="space-y-4"
    >
      {errorMsg && <div className="bg-red-100 p-4 rounded-md text-red-500 text-sm">{errorMsg}</div>}
      <form.AppField name="password">
        {() => <FormInput required type="password" placeholder="Пароль" label="Пароль" />}
      </form.AppField>
      <form.AppField name="repeatPassword">
        {() => (
          <FormInput
            required
            type="password"
            placeholder="Повторно введіть пароль"
            label="Повторно введіть пароль"
          />
        )}
      </form.AppField>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit]) => (
          <Button
            className="w-full"
            loading={loading}
            type="submit"
            size="lg"
            disabled={!canSubmit || loading}
          >
            Відновити пароль
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

export default UpdatePasswordForm;
