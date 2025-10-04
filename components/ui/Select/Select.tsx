import SelectUI, { MultiValue } from 'react-select';

export type OptionType = {
  label: string;
  value: string;
};

type SelectProps = {
  options: OptionType[];
  values: string[];
  onChange: (newValue: MultiValue<OptionType>) => void;
};

export const Select = ({ options, values, onChange }: SelectProps) => {
  const selectedOptions = values
    .map((value) => options.find((option) => option.value === value))
    .filter(Boolean) as OptionType[];
  return <SelectUI value={selectedOptions} isMulti onChange={onChange} options={options} />;
};
