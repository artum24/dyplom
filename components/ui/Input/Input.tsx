import * as React from 'react';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import { Label } from '@/components/ui/Label/Label';
import { cn } from '@/lib/utils/utils';
import { useFieldContext } from '@/hooks/useFieldContext';

export type InputErrorType = {
  message: string;
};

type InputProps = React.ComponentProps<'input'> & {
  icon?: IconName;
  label?: string;
  required?: boolean;
  errors?: Array<InputErrorType> | undefined;
};

export function Input({
  errors,
  required,
  label,
  icon,
  className,
  name,
  type,
  value,
  ...props
}: InputProps) {
  const showError = !!errors?.length;
  return (
    <div className="w-full">
      {label && (
        <Label className="mb-2">
          {label}
          {required ? <span className="text-red-500">*</span> : ''}
        </Label>
      )}
      <div className="relative w-full">
        {!!icon && <DynamicIcon className="absolute top-2 left-2" size="20" name={icon} />}
        <input
          type={type}
          id={name}
          name={name}
          value={value as string}
          data-slot="input"
          className={cn(
            `border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 ${icon && 'pl-10'} py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm`,
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]',
            'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
            showError &&
              'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/50',
            className
          )}
          {...props}
        />
      </div>
      {showError ? (
        <p className="text-red-500 text-xs" role="alert">
          {errors[0]?.message}
        </p>
      ) : null}
    </div>
  );
}

export function FormInput({ required, label, icon, className, type, ...props }: InputProps) {
  const field = useFieldContext();
  const errors = field.state.meta.isTouched ? [...field.state.meta.errors] : [];
  const name = field.name;
  const value = field.state.value as string;

  return (
    <Input
      required={required}
      label={label}
      icon={icon}
      className={className}
      type={type}
      name={name}
      value={value}
      errors={errors}
      onBlur={field.handleBlur}
      onChange={(e) => {
        field?.handleChange(e.target.value);
      }}
      {...props}
    />
  );
}
