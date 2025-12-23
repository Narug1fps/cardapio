'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi'
import { FaSpinner } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import type { Dish, Category } from '@/types/menu'

export default function DishesListPage() {
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

    const handleDelete = async (id: string) => {
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

    const toggleAvailability = async (dish: Dish) => {
        try {
            const res = await fetch(`/api/dishes/${dish.$id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ available: !dish.available })
            })

            if (res.ok) {
                setDishes(dishes.map(d =>
                    d.$id === dish.$id ? { ...d, available: !d.available } : d
                ))
            }
        } catch (error) {
            console.error('Error toggling availability:', error)
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
                <FaSpinner className="w-8 h-8 animate-spin text-amber-500" />
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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Pratos</h1>
                        <p className="text-zinc-400">Gerencie os pratos do cardápio</p>
                    </div>
                    <Link href="/admin/dishes/new" className="btn btn-primary">
                        <FiPlus className="w-4 h-4" />
                        Novo Prato
                    </Link>
                </div>

                <div className="card">
                    {loadingData ? (
                        <div className="flex items-center justify-center py-12">
                            <FaSpinner className="w-6 h-6 animate-spin text-amber-500" />
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
                                    {dishes.map(dish => {
                                        const category = categories.find(c => c.$id === dish.categoryId)
                                        return (
                                            <tr key={dish.$id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="text-white font-medium">{dish.name}</p>
                                                        <p className="text-zinc-500 text-sm line-clamp-1">{dish.description}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-zinc-400">{category?.name || '-'}</td>
                                                <td className="py-3 px-4 text-amber-400 font-medium">{formatPrice(dish.price)}</td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => toggleAvailability(dish)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${dish.available
                                                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                            }`}
                                                    >
                                                        {dish.available ? 'Disponível' : 'Indisponível'}
                                                    </button>
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
                                                            onClick={() => handleDelete(dish.$id)}
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
