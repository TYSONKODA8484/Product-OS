import React, { createContext, useContext, useState } from 'react'
import { I } from './Icon'

interface Toast { id: string; msg: string }
type PushToast = (msg: string) => void

const ToastCtx = createContext<PushToast | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push: PushToast = (msg) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, msg }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2400)
  }
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <span className="ok"><I.Check size={14}/></span>{t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export const useToast = () => {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
