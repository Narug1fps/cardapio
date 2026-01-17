'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiMail, FiLock, FiLogIn, FiLoader } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'
import { useMenuSettings } from '@/components/MenuThemeProvider'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [checkingAuth, setCheckingAuth] = useState(true)
    const { settings } = useMenuSettings()

    useEffect(() => {
        // Check if already logged in
        const checkAuth = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    router.push('/admin')
                }
            } catch {
                // Not logged in
            } finally {
                setCheckingAuth(false)
            }
        }
        checkAuth()
    }, [router])

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data: LoginForm) => {
        setError('')
        setIsLoading(true)

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (authError) {
                throw authError
            }

            router.push('/admin')
        } catch (err: any) {
            setError(err.message || 'Email ou senha inválidos')
        } finally {
            setIsLoading(false)
        }
    }

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: settings?.backgroundColor || '#09090b' }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: settings?.primaryColor || '#f59e0b' }}></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: settings?.backgroundColor || '#09090b' }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                        style={{
                            background: `linear-gradient(to bottom right, ${settings?.primaryColor || '#f59e0b'}, ${settings?.secondaryColor || '#ea580c'})`,
                            boxShadow: `0 10px 15px -3px ${settings?.primaryColor || '#f59e0b'}40`
                        }}
                    >
                        <span className="text-white font-bold text-2xl">🍽️</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: settings?.textColor || '#ffffff' }}>Admin Login</h1>
                    <p style={{ color: settings?.textColor || '#a1a1aa', opacity: 0.6 }}>Entre para gerenciar o cardápio</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl p-6 space-y-6 border border-gray-700" style={{ backgroundColor: settings?.cardBackgroundColor || 'rgba(24, 24, 27, 0.5)' }}>
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: settings?.textColor || '#d4d4d8' }}>
                            Email
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: settings?.textColor || '#71717a', opacity: 0.5 }} />
                            <input
                                type="email"
                                {...register('email')}
                                className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none bg-black/10 border border-gray-600 transition-colors"
                                style={{
                                    color: settings?.textColor || '#ffffff',
                                }}
                                placeholder="admin@restaurante.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: settings?.textColor || '#d4d4d8' }}>
                            Senha
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: settings?.textColor || '#71717a', opacity: 0.5 }} />
                            <input
                                type="password"
                                {...register('password')}
                                className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none bg-black/10 border border-gray-600 transition-colors"
                                style={{
                                    color: settings?.textColor || '#ffffff',
                                }}
                                placeholder="••••••••"
                            />
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                        style={{
                            background: `linear-gradient(to right, ${settings?.primaryColor || '#f59e0b'}, ${settings?.secondaryColor || '#ea580c'})`,
                            boxShadow: `0 4px 6px -1px ${settings?.primaryColor || '#f59e0b'}40`
                        }}
                    >
                        {isLoading ? (
                            <>
                                <FiLoader className="w-5 h-5 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            <>
                                <FiLogIn className="w-5 h-5" />
                                Entrar
                            </>
                        )}
                    </button>
                </form>

                <p className="text-center text-sm mt-6">
                    <a href="/" className="hover:opacity-80 transition-opacity" style={{ color: settings?.primaryColor || '#fbbf24' }}>
                        ← Voltar ao cardápio
                    </a>
                </p>
            </div>
        </div>
    )
}
