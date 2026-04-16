'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { X, RotateCcw } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ToastType = 'message' | 'success' | 'warning' | 'error';

interface Toast {
  id: number; text: string | ReactNode; type: ToastType;
  measuredHeight?: number; timeout?: ReturnType<typeof setTimeout>;
  remaining?: number; start?: number;
  pause?: () => void; resume?: () => void;
  preserve?: boolean; action?: string;
  onAction?: () => void; onUndoAction?: () => void;
}

interface Message {
  text: string | ReactNode; preserve?: boolean; action?: string;
  onAction?: () => void; onUndoAction?: () => void;
}

// ─── Styles per type ──────────────────────────────────────────────────────────
const TYPE_STYLE: Record<ToastType, React.CSSProperties> = {
  message: { background: '#FFFFFF',   color: '#2D1F3E', border: '1px solid #EDE6DE' },
  success: { background: '#4A7A5A',   color: '#FFFFFF', border: '1px solid #5A9A6A' },
  warning: { background: '#F2EAE0',   color: '#B8720A', border: '1px solid #E8D5B0' },
  error:   { background: '#C0445A',   color: '#FFFFFF', border: '1px solid #D0556A' },
};

// ─── Store ────────────────────────────────────────────────────────────────────
let root: ReturnType<typeof createRoot> | null = null;
let toastId = 0;

const store = {
  toasts: [] as Toast[],
  listeners: new Set<() => void>(),

  add(text: string | ReactNode, type: ToastType, preserve?: boolean, action?: string, onAction?: () => void, onUndoAction?: () => void) {
    const id = toastId++;
    const toast: Toast = { id, text, type, preserve, action, onAction, onUndoAction };

    if (!preserve) {
      toast.remaining = 4000; toast.start = Date.now();
      const close = () => { this.toasts = this.toasts.filter(t => t.id !== id); this.notify(); };
      toast.timeout = setTimeout(close, toast.remaining);
      toast.pause = () => {
        if (!toast.timeout) return;
        clearTimeout(toast.timeout); toast.timeout = undefined;
        toast.remaining! -= Date.now() - toast.start!;
      };
      toast.resume = () => {
        if (toast.timeout) return;
        toast.start = Date.now();
        toast.timeout = setTimeout(close, toast.remaining);
      };
    }
    this.toasts.push(toast); this.notify();
  },

  remove(id: number) { this.toasts = this.toasts.filter(t => t.id !== id); this.notify(); },
  subscribe(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  notify() { this.listeners.forEach(fn => fn()); },
};

// ─── Container Component ─────────────────────────────────────────────────────
function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shownIds, setShownIds] = useState<number[]>([]);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setToasts([...store.toasts]);
    return store.subscribe(() => setToasts([...store.toasts]));
  }, []);

  useEffect(() => {
    const unseen = toasts.filter(t => !shownIds.includes(t.id)).map(t => t.id);
    if (unseen.length) requestAnimationFrame(() => setShownIds(p => [...p, ...unseen]));
  }, [toasts]);

  const measureRef = (toast: Toast) => (node: HTMLDivElement | null) => {
    if (node && toast.measuredHeight == null) { toast.measuredHeight = node.getBoundingClientRect().height; store.notify(); }
  };

  const lastVisible = 3;
  const visibleStart = Math.max(0, toasts.length - lastVisible);

  const getTransform = (index: number, total: number) => {
    if (index === total - 1) return 'none';
    const offset = total - 1 - index;
    let ty = toasts[total - 1]?.measuredHeight || 60;
    for (let i = total - 1; i > index; i--) ty += hovered ? (toasts[i-1]?.measuredHeight || 60) + 10 : 20;
    return `translate3d(0, calc(100% - ${ty}px), ${-offset}px) scale(${hovered ? 1 : 1 - 0.05 * offset})`;
  };

  const containerH = toasts.slice(visibleStart).reduce((a, t) => a + (t.measuredHeight ?? 60), 0);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] pointer-events-none" style={{ width: 380, height: containerH }}>
      <div className="relative pointer-events-auto w-full" style={{ height: containerH }}
        onMouseEnter={() => { setHovered(true); store.toasts.forEach(t => t.pause?.()); }}
        onMouseLeave={() => { setHovered(false); store.toasts.forEach(t => t.resume?.()); }}>
        {toasts.map((toast, idx) => {
          const visible = idx >= visibleStart;
          const style = TYPE_STYLE[toast.type];
          return (
            <div key={toast.id} ref={measureRef(toast)}
              className="absolute right-0 bottom-0 rounded-2xl p-4 shadow-xl"
              style={{
                ...style, width: 380,
                transition: 'all .35s cubic-bezier(.25,.75,.6,.98)',
                transform: shownIds.includes(toast.id) ? getTransform(idx, toasts.length) : 'translate3d(0, 100%, 150px) scale(1)',
                opacity: visible ? 1 : 0,
                pointerEvents: idx < visibleStart ? 'none' : 'auto',
              }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-relaxed">{toast.text}</p>
                <div className="flex items-center gap-1 shrink-0">
                  {toast.onUndoAction && (
                    <button onClick={() => { toast.onUndoAction?.(); store.remove(toast.id); }}
                      className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ opacity: 0.7 }}>
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {!toast.action && (
                    <button onClick={() => store.remove(toast.id)}
                      className="p-1.5 rounded-lg hover:opacity-70 transition-opacity" style={{ opacity: 0.7 }}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              {toast.action && (
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button onClick={() => store.remove(toast.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-70" style={{ opacity: 0.7 }}>
                    Dismiss
                  </button>
                  <button onClick={() => { toast.onAction?.(); store.remove(toast.id); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                    {toast.action}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Mount once ───────────────────────────────────────────────────────────────
function mount() {
  if (root) return;
  const el = document.createElement('div');
  document.body.appendChild(el);
  root = createRoot(el);
  root.render(<ToastContainer />);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  return {
    success: useCallback((text: string) => { mount(); store.add(text, 'success'); }, []),
    error:   useCallback((text: string) => { mount(); store.add(text, 'error'); }, []),
    warning: useCallback((text: string) => { mount(); store.add(text, 'warning'); }, []),
    message: useCallback((msg: Message) => { mount(); store.add(msg.text, 'message', msg.preserve, msg.action, msg.onAction, msg.onUndoAction); }, []),
  };
}
