'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const variantStyles: Record<string, React.CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, var(--purple), var(--lavender))',
    color: '#fff',
    boxShadow: '0 4px 12px rgba(155,142,199,0.35)',
  },
  secondary: {
    background: 'var(--teal-light)',
    color: 'var(--teal-dark)',
    border: '1px solid var(--teal)',
  },
  danger: {
    background: '#FFF0F2',
    color: '#C0445A',
    border: '1px solid #FFCCD5',
  },
  success: {
    background: '#EEF5F0',
    color: '#4A7A5A',
    border: '1px solid #B8D8C0',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
  },
  outline: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
  },
};

const sizeStyles: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, style, ...props }, ref) => {
    const baseClass = 'inline-flex items-center justify-center font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-95';

    return (
      <button
        ref={ref}
        className={cn(baseClass, sizeStyles[size], className)}
        style={{ ...variantStyles[variant], ...style }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
