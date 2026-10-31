import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-forest" />;
        let borderColor = 'border-forest/20';
        let bgStyle = 'bg-white/95';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-forest" />;
          borderColor = 'border-sage';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
          borderColor = 'border-amber-300';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-red-600" />;
          borderColor = 'border-red-300';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-elevated border ${borderColor} ${bgStyle} backdrop-blur-md transform transition-all duration-300 animate-in slide-in-from-bottom-2`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-desk-primary">{toast.title}</h4>
              <p className="text-xs text-desk-secondary mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-desk-secondary hover:text-desk-primary p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
