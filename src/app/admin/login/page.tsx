'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiMail, FiLock, FiLogIn, FiLoader } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const { login } = useAuth()
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

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
            await login(data.email, data.password)
            router.push('/admin')
        } catch {
            setError('Email ou senha inválidos')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
                    <p className="text-zinc-400">Entre para gerenciar o cardápio</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
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
                                className="w-full pl-10 pr-4 py-3"
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
                                className="w-full pl-10 pr-4 py-3"
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
                        className="btn btn-primary w-full py-3"
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
