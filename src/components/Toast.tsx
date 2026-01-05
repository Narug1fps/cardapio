'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void
    success: (message: string) => void
    error: (message: string) => void
    warning: (message: string) => void
    info: (message: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

const toastIcons: Record<ToastType, ReactNode> = {
    success: <FiCheck className="w-5 h-5" />,
    error: <FiX className="w-5 h-5" />,
    warning: <FiAlertCircle className="w-5 h-5" />,
    info: <FiInfo className="w-5 h-5" />
}

const toastStyles: Record<ToastType, string> = {
    success: 'bg-emerald-500/90 text-white border-emerald-400',
    error: 'bg-red-500/90 text-white border-red-400',
    warning: 'bg-amber-500/90 text-white border-amber-400',
    info: 'bg-blue-500/90 text-white border-blue-400'
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now().toString()
        setToasts(prev => [...prev, { id, message, type }])

        // Auto-remove after 4 seconds
        setTimeout(() => {
            removeToast(id)
        }, 4000)
    }, [removeToast])

    const success = useCallback((message: string) => showToast(message, 'success'), [showToast])
    const error = useCallback((message: string) => showToast(message, 'error'), [showToast])
    const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast])
    const info = useCallback((message: string) => showToast(message, 'info'), [showToast])

    return (
        <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
            {children}

            {/* Toast Container */}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-in ${toastStyles[toast.type]}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        {toastIcons[toast.type]}
                        <p className="font-medium text-sm">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-auto p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <FiX className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            <style jsx global>{`
                @keyframes slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
