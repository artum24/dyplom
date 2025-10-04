import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Підтвердження акаунту',
  description:
    'Підтвердження електронної пошти: ми надіслали лист із посиланням на вашу адресу. Натисніть на нього, щоб підтвердити акаунт і отримати повний доступ.',
};

export default function VerifyEmailPage() {
  return (
    <>
      <h1 className="mb-5 text-3xl font-bold text-gray-800">
        На ваш email надіслано лист для підтвердження
      </h1>
      <p className="text-gray-500 text-sm">
        Лист було надіслано на пошту. Натисніть на лінк на пошті щоб підтвердити ваш акаунт.
      </p>
    </>
  );
}
