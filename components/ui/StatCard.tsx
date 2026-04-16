import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({ title, value, icon, description, trend, className }: StatCardProps) {
  return (
    <div
      className={cn('rounded-2xl p-5 transition-all hover:-translate-y-0.5', className)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'var(--cream)' }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: 'var(--purple)' }}>
        {value}
      </p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
      {description && (
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
      {trend && (
        <div className="flex items-center mt-2 gap-1">
          <span
            className="text-xs font-semibold"
            style={{ color: trend.isPositive ? '#4A7A5A' : '#C0445A' }}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs last month</span>
        </div>
      )}
    </div>
  );
}
