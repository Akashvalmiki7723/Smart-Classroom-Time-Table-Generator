import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, hint, id, style, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium mb-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn('w-full px-4 py-2.5 rounded-xl text-sm transition-all', className)}
          style={{
            border: error ? '1.5px solid #C0445A' : '1.5px solid var(--border)',
            background: 'var(--cream-light)',
            color: 'var(--text-primary)',
            outline: 'none',
            ...style,
          }}
          onFocus={e => {
            e.target.style.borderColor = error ? '#C0445A' : 'var(--purple)';
            e.target.style.background = '#fff';
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? '#C0445A' : 'var(--border)';
            e.target.style.background = 'var(--cream-light)';
          }}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs" style={{ color: '#C0445A' }}>{error}</p>}
        {(helperText || hint) && !error && (
          <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>{helperText || hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
