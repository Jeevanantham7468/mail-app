import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        let border = 'border-gray-200';
        let icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;

        if (toast.type === 'success') {
          border = 'border-green-200';
          icon = <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />;
        } else if (toast.type === 'error') {
          border = 'border-red-200';
          icon = <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border bg-white shadow-lg transition-all text-sm text-gray-800 ${border}`}
          >
            {icon}
            <div className="flex-1 text-sm font-medium leading-snug">
              {toast.title && <div className="font-semibold text-gray-900 mb-0.5">{toast.title}</div>}
              <div>{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
