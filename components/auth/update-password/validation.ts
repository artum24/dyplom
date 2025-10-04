import * as v from 'valibot';

import { passwordValidation } from '@app/utils/helpers/validators';

export const updatePasswordSchema = v.pipe(
  v.object({
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
