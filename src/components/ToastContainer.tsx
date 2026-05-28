import React from 'react';
import { Check, Info, X } from 'lucide-react';
import { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        const bgColors = {
          success: 'bg-[#f0f9f4] border-emerald-100 text-emerald-800 shadow-emerald-100/50',
          error: 'bg-[#fef2f2] border-red-100 text-red-800 shadow-red-100/50',
          info: 'bg-[#f4faff] border-sky-100 text-sky-800 shadow-sky-100/50'
        };
        const iconColors = {
          success: 'text-emerald-500',
          error: 'text-red-500',
          info: 'text-sky-500'
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-lg smooth-transition translate-y-0 opacity-100 transform ${bgColors[toast.type] || bgColors.info}`}
            style={{ animation: 'bounce-slow 3s infinite ease-in-out' }}
          >
            <div className={`flex-shrink-0 ${iconColors[toast.type] || iconColors.info}`}>
              {toast.type === 'success' && <Check className="w-5 h-5 bg-emerald-100 rounded-full p-0.5" />}
              {toast.type === 'error' && <X className="w-5 h-5 bg-red-100 rounded-full p-0.5" />}
              {toast.type === 'info' && <Info className="w-5 h-5 bg-sky-100 rounded-full p-0.5" />}
            </div>
            <div className="flex-grow text-sm font-medium tracking-wide">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-stone-400 hover:text-stone-600 smooth-transition p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
