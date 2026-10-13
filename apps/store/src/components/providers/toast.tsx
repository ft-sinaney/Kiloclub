"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

const ToastContext = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((text: string) => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2600);
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-8"
      >
        {message && (
          <div className="flex items-center gap-2 rounded-full border border-gold-500/40 bg-ink-800/95 px-4 py-2.5 text-sm text-white shadow-2xl backdrop-blur">
            <CheckCircle2 className="size-4 text-gold-400" />
            {message}
          </div>
        )}
      </div>
    </ToastContext>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
