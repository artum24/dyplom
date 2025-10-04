'use client';

import * as React from 'react';
import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import * as v from 'valibot';
import { toast } from 'sonner';
import { useAppForm } from '@/hooks/useFieldContext';
import { FormInput } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const supabase = useSupabaseClient();
  const form = useAppForm({
    defaultValues: {
      email: '',
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      setErrorMsg('');

      const email = value.email;

      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (data) {
        toast.success('Посилання на відновлення паролю надіслано на ваш поштовйи адрес!');
      }
      if (error) {
        setErrorMsg(error.message);
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
      <form.AppField
        validators={{
          onSubmit: v.pipe(v.string(), v.nonEmpty('Будь ласка введіть електронну пошту')),
        }}
        name="email"
      >
        {() => <FormInput placeholder="Введіть електронну пошту" label="Електронна пошта" />}
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
            Надіслати лінк для відновлення
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
};

export default ForgotPasswordForm;
