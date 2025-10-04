'use client';

import * as React from 'react';
import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { signUpSchema } from './validation';
import { useAppForm } from '@/hooks/useFieldContext';
import { FormInput } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { GoogleIcon } from '@/components/icons/GoogleIcon';

const SignUpForm = () => {
  const [loading, setLoading] = useState(false);
  const [isExistedUser, setIsExistedUser] = useState(false);
  const router = useRouter();
  const supabase = useSupabaseClient();

  const form = useAppForm({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      repeatPassword: '',
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value: { email, password, firstName, lastName } }) => {
      setLoading(true);
      setIsExistedUser(false);
      const res = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: `${firstName}${lastName ? ` ${lastName}` : ''}`,
          },
        },
      });

      if (res.data.user?.user_metadata.email) {
        if (!res.data.user?.user_metadata?.email_verified) {
          router.push('/verify-email');
        }
      } else {
        setIsExistedUser(true);
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
      {isExistedUser && (
        <div className="bg-red-100 p-4 rounded-md text-red-600 text-sm">
          Користувач з такою електронну пошту вже існує.{' '}
          <Link href="/login" className="underline font-bold">
            Увійти до акаунту
          </Link>
        </div>
      )}

      <form.AppField name="email">
        {() => (
          <FormInput
            required
            placeholder="Введіть електронну пошту"
            label="Електронна пошта"
            type="email"
          />
        )}
      </form.AppField>
      <div className="grid md:grid-cols-2 gap-4">
        <form.AppField name="firstName">
          {() => <FormInput required placeholder="Введіть ім'я" label="Ім'я" />}
        </form.AppField>
        <form.AppField name="lastName">
          {() => <FormInput placeholder="Введіть прізвище" label="Прізвище" />}
        </form.AppField>
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
      </div>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit]) => (
          <Button
            className="w-full mt-4"
            loading={loading}
            type="submit"
            size="lg"
            disabled={!canSubmit || loading}
          >
            Створити акаунт
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
        Створити акаунт з Google
      </Button>
    </form>
  );
};

export default SignUpForm;
