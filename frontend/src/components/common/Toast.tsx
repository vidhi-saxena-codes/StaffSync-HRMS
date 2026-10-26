import React from 'react';
import { useHR } from '../../context/HRContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useHR();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg text-sm transition-all duration-200 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800 shadow-slate-900/10'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-50 border-rose-800 shadow-rose-950/20'
              : 'bg-slate-900 text-white border-slate-800 shadow-slate-900/10'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            {toast.type === 'info' && (
              <Info className="w-4 h-4 text-indigo-400" />
            )}
          </div>
          <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
