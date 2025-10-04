import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input/Input';
import { Dispatch, SetStateAction } from 'react';

type ActionsProps = {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
};

export const Actions = ({ query, setQuery }: ActionsProps) => {
  return (
    <section className="mx-auto px-4 py-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <Input
        className="pl-9"
        placeholder="Пошук лікаря, кабінету або відділення"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </section>
  );
};
