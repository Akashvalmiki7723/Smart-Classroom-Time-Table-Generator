import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: { background: 'var(--cream)',         color: 'var(--text-secondary)' },
  success: { background: '#EEF5F0',              color: '#4A7A5A' },
  warning: { background: '#FEF9E7',              color: '#B8720A' },
  danger:  { background: '#FFF0F2',              color: '#C0445A' },
  error:   { background: 'var(--lavender-light)', color: 'var(--purple-dark)' },
  info:    { background: 'var(--teal-light)',     color: 'var(--teal-dark)' },
};

export default function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={cn('inline-flex items-center font-semibold rounded-full', sizeClass, className)}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
