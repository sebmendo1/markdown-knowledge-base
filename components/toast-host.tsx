"use client";

import { useEffect, useState } from "react";

const EVENT = "markdown-kb-toast";

type Toast = { id: number; message: string; action?: { label: string; run: () => void } };

export function notify(message: string, action?: Toast["action"]) {
  window.dispatchEvent(new CustomEvent<Toast>(EVENT, { detail: { id: Date.now(), message, action } }));
}

export function ToastHost() {
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    const show = (event: Event) => setToast((event as CustomEvent<Toast>).detail);
    window.addEventListener(EVENT, show);
    return () => window.removeEventListener(EVENT, show);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 6000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{toast.message}</span>
      {toast.action ? (
        <button
          type="button"
          onClick={() => {
            toast.action?.run();
            setToast(null);
          }}
        >
          {toast.action.label}
        </button>
      ) : null}
    </div>
  );
}
