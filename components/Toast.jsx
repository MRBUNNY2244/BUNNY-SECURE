'use client';
import { useState, useCallback } from 'react';

let addToast;

export function useToast() {
  return { toast: addToast };
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  addToast = useCallback((msg, type = 'ok') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  }, []);

  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}
