import * as v from 'valibot';
import { passwordValidation } from '@/lib/helpers/validators';

export const signUpSchema = v.pipe(
  v.object({
    firstName: v.pipe(v.string(), v.minLength(2, 'Мінімальна довжина 2')),
    lastName: v.pipe(v.string()),
    email: v.pipe(
      v.string(),
      v.nonEmpty('Будь ласка введіть поштовий адрес'),
      v.email('Не валідний поштовий адрес'),
      v.maxLength(50, 'Занадто довгий поштовий адрес')
    ),
    password: passwordValidation,
    repeatPassword: v.pipe(v.string()),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['repeatPassword']],
      (input) => input.password === input.repeatPassword,
      'Пароль не співпадає'
    ),
    ['repeatPassword']
  )
);
