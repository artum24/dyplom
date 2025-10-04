'use client';

import * as React from 'react';
import { useState } from 'react';
import * as v from 'valibot';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAppForm } from '@/hooks/useFieldContext';
import { Button } from '@/components/ui/Button/Button';
import { FormInput } from '@/components/ui/Input/Input';
import { GoogleIcon } from '@/components/icons/GoogleIcon';

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = useSupabaseClient();

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      setErrorMsg('');

      const email = value.email;
      const password = value.password;

      const res = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (res.data.user) {
        router.push('/auth/callback');
      }
      if (res?.error) {
        setErrorMsg('Неправильна електронна пошта або пароль');
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
      <form.AppField
        validators={{
          onSubmit: v.pipe(v.string(), v.nonEmpty('Будь ласка введіть пароль')),
        }}
        name="password"
      >
        {() => <FormInput type="password" placeholder="Пароль" label="Пароль" />}
      </form.AppField>
      <Link className="text-red-600 underline flex justify-end mt-2" href="/forgot-password">
        Забули пароль?
      </Link>
      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit]) => (
          <Button
            className="w-full"
            loading={loading}
            type="submit"
            size="lg"
            disabled={!canSubmit || loading}
          >
            Увійти
          </Button>
        )}
      </form.Subscribe>

      <div className="flex items-center text-gray-500 gap-2">
        <div className="border-1 w-full" />
        <p>або</p>
        <div className="border-1 w-full" />
      </div>

      <Button
        variant="outline"
        type="button"
        onClick={() =>
          supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
          })
        }
        className="w-full"
        size="lg"
      >
        <GoogleIcon />
        Увійти за допомогою Google
      </Button>
    </form>
  );
};

export default LoginForm;
