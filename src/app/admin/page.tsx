'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiTrash2, FiLoader, FiGrid, FiTag } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import type { Dish, Category } from '@/types/menu'

export default function AdminDashboard() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const [dishes, setDishes] = useState<Dish[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dishesRes, categoriesRes] = await Promise.all([
                    fetch('/api/dishes'),
                    fetch('/api/categories')
                ])

                if (dishesRes.ok) {
                    const data = await dishesRes.json()
                    setDishes(data.dishes || [])
                }

                if (categoriesRes.ok) {
                    const data = await categoriesRes.json()
                    setCategories(data.categories || [])
                }
            } catch (error) {
                console.error('Error fetching data:', error)
            } finally {
                setLoadingData(false)
            }
        }

        if (user) {
            fetchData()
        }
    }, [user])

    const handleDeleteDish = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este prato?')) return

        try {
            const res = await fetch(`/api/dishes/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setDishes(dishes.filter(d => d.$id !== id))
            }
        } catch (error) {
            console.error('Error deleting dish:', error)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FiLoader className="w-8 h-8 animate-spin text-amber-500" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen">
            <AdminSidebar />

            <main className="ml-64 p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-zinc-400">Bem-vindo ao painel administrativo</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <FiGrid className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-zinc-400 text-sm">Total de Pratos</p>
                                <p className="text-2xl font-bold text-white">{dishes.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <FiTag className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-zinc-400 text-sm">Categorias</p>
                                <p className="text-2xl font-bold text-white">{categories.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <span className="text-xl">✓</span>
                            </div>
                            <div>
                                <p className="text-zinc-400 text-sm">Disponíveis</p>
                                <p className="text-2xl font-bold text-white">
                                    {dishes.filter(d => d.available).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <span className="text-xl">✗</span>
                            </div>
                            <div>
                                <p className="text-zinc-400 text-sm">Indisponíveis</p>
                                <p className="text-2xl font-bold text-white">
                                    {dishes.filter(d => !d.available).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Dishes */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Pratos Recentes</h2>
                        <Link href="/admin/dishes/new" className="btn btn-primary">
                            <FiPlus className="w-4 h-4" />
                            Novo Prato
                        </Link>
                    </div>

                    {loadingData ? (
                        <div className="flex items-center justify-center py-12">
                            <FiLoader className="w-6 h-6 animate-spin text-amber-500" />
                        </div>
                    ) : dishes.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-zinc-400 mb-4">Nenhum prato cadastrado</p>
                            <Link href="/admin/dishes/new" className="btn btn-primary">
                                <FiPlus className="w-4 h-4" />
                                Adicionar Primeiro Prato
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-800">
                                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Nome</th>
                                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Categoria</th>
                                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Preço</th>
                                        <th className="text-left py-3 px-4 text-zinc-400 font-medium">Status</th>
                                        <th className="text-right py-3 px-4 text-zinc-400 font-medium">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dishes.slice(0, 10).map(dish => {
                                        const category = categories.find(c => c.$id === dish.categoryId)
                                        return (
                                            <tr key={dish.$id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                                                <td className="py-3 px-4 text-white">{dish.name}</td>
                                                <td className="py-3 px-4 text-zinc-400">{category?.name || '-'}</td>
                                                <td className="py-3 px-4 text-amber-400">{formatPrice(dish.price)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${dish.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {dish.available ? 'Disponível' : 'Indisponível'}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/dishes/${dish.$id}/edit`}
                                                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                                        >
                                                            <FiEdit2 className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteDish(dish.$id)}
                                                            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
