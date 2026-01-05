'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiMail, FiLock, FiLogIn, FiLoader } from 'react-icons/fi'
import { supabase } from '@/lib/supabase'

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
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
                        <span className="text-white font-bold text-2xl">🍽️</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
                    <p className="text-zinc-400">Entre para gerenciar o cardápio</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                            <input
                                type="email"
                                {...register('email')}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                                placeholder="admin@restaurante.com"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                            <input
                                type="password"
                                {...register('password')}
                                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
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
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50"
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

                <p className="text-center text-zinc-500 text-sm mt-6">
                    <a href="/" className="text-amber-400 hover:text-amber-300">
                        ← Voltar ao cardápio
                    </a>
                </p>
            </div>
        </div>
    )
}
