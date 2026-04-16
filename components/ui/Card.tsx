import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, style, ...props }, ref) => {
    const baseStyle = {
      background: 'var(--surface)',
      borderRadius: 'var(--radius)',
      boxShadow: variant === 'default' ? 'var(--shadow-sm)' : 'none',
      border: variant === 'bordered' ? '1px solid var(--border)' : '1px solid var(--border-light)',
      ...style,
    };

    return (
      <div ref={ref} className={cn('', className)} style={baseStyle} {...props}>
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4', className)}
      style={{ borderBottom: '1px solid var(--border-light)', ...style }}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, style, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-base font-semibold', className)}
      style={{ color: 'var(--text-primary)', ...style }}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('px-6 py-4', className)}
      style={{ borderTop: '1px solid var(--border-light)', ...style }}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
