import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, children, style, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn('w-full px-4 py-2.5 rounded-xl text-sm transition-all appearance-none cursor-pointer', className)}
          style={{
            border: error ? '1.5px solid #C0445A' : '1.5px solid var(--border)',
            background: 'var(--cream-light)',
            color: 'var(--text-primary)',
            outline: 'none',
            ...style,
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children ? children : options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs" style={{ color: '#C0445A' }}>{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
