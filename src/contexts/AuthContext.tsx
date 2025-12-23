'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const checkAuth = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        } catch {
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            throw error
        }

        await checkAuth()
    }

    const logout = async () => {
        try {
            await supabase.auth.signOut()
            router.push('/admin/login')
        } catch (error) {
            console.error('Error logging out:', error)
        } finally {
            setUser(null)
        }
    }

    useEffect(() => {
        checkAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
