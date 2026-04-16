import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyMessage = 'No data available',
  onRowClick,
}: TableProps<T>) {
  const getKey = keyExtractor || ((item: T, index?: number) => {
    const id = (item as Record<string, unknown>)._id;
    return id ? String(id) : String(index);
  });

  if (isLoading) {
    return (
      <div className="rounded-xl overflow-hidden p-6" style={{ background: 'var(--surface)' }}>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-4 rounded-lg" style={{ background: 'var(--cream)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background: 'var(--cream)', borderBottom: '1px solid var(--border-light)' }}>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn('px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider', column.className)}
                  style={{ color: 'var(--text-muted)' }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={getKey(item, index)}
                  onClick={() => onRowClick?.(item)}
                  className={cn('transition-colors', onRowClick && 'cursor-pointer')}
                  style={{ borderBottom: '1px solid var(--border-light)' }}
                  onMouseEnter={e => { if (onRowClick) (e.currentTarget as HTMLElement).style.background = 'var(--cream-light)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn('px-6 py-4 text-sm', column.className)}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[column.key as string] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
