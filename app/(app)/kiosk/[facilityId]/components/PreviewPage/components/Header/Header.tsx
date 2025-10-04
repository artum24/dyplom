import { Map } from 'lucide-react';

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-slate-200">
      <div className="mx-auto px-4 py-3 flex items-center gap-3">
        <Map className="h-6 w-6" />
        <div className="flex-1">
          <h1 className="text-lg font-semibold leading-none">Навігація по медзакладу</h1>
          <p className="text-sm text-slate-500">Знайдіть кабінет, лікаря</p>
        </div>
      </div>
    </header>
  );
};
