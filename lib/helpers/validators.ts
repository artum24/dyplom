import * as v from 'valibot';

export const passwordValidation = v.pipe(
  v.string(),
  v.minLength(8, 'Мінімальна кількість символів 8'),
  v.maxLength(30, 'Максимальна кількість символів 30'),
  v.regex(/[a-z]/, 'Пароль повинен містити малу літеру'),
  v.regex(/[A-Z]/, 'Пароль повинен містити велику літеру'),
  v.regex(/[0-9]/, 'Пароль повинен містити число')
);
