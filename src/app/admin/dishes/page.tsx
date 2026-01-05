'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi'
import { FaSpinner } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/components/Toast'
import type { Dish, Category } from '@/types/menu'

export default function DishesListPage() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const { success, error } = useToast()
    const [dishes, setDishes] = useState<Dish[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)

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
                    setDishes(Array.isArray(data) ? data : (data.dishes || []))
                }

                if (categoriesRes.ok) {
                    const data = await categoriesRes.json()
                    setCategories(Array.isArray(data) ? data : (data.categories || []))
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                error('Erro ao carregar dados')
            } finally {
                setLoadingData(false)
            }
        }

        if (user) {
            fetchData()
        }
    }, [user])

    const handleDelete = async () => {
        if (!deleteConfirmation) return

        try {
            const res = await fetch(`/api/dishes/${deleteConfirmation}`, { method: 'DELETE' })
            if (res.ok) {
                setDishes(dishes.filter(d => d.$id !== deleteConfirmation))
                success('Prato excluído com sucesso')
            } else {
                error('Erro ao excluir prato')
            }
        } catch (err) {
            console.error('Error deleting dish:', err)
            error('Erro ao excluir prato')
        } finally {
            setDeleteConfirmation(null)
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
        } catch (err) {
            console.error('Error toggling availability:', err)
            error('Erro ao alterar disponibilidade')
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
            <div className="flex items-center justify-center h-64">
                <FaSpinner className="w-8 h-8 animate-spin" style={{ color: 'var(--menu-primary, #f59e0b)' }} />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--menu-text, #fff)' }}>Pratos</h1>
                    <p style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>Gerencie os pratos do cardápio</p>
                </div>
                <Link
                    href="/admin/dishes/new"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{ backgroundColor: 'var(--menu-primary, #f59e0b)', color: '#fff' }}
                >
                    <FiPlus className="w-4 h-4" />
                    Novo Prato
                </Link>
            </div>

            <div className="w-full rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'transparent' }}>
                {loadingData ? (
                    <div className="flex items-center justify-center py-12">
                        <FaSpinner className="w-6 h-6 animate-spin" style={{ color: 'var(--menu-primary, #f59e0b)' }} />
                    </div>
                ) : dishes.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="mb-4" style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>Nenhum prato cadastrado</p>
                        <Link
                            href="/admin/dishes/new"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
                            style={{ backgroundColor: 'var(--menu-primary, #f59e0b)', color: '#fff' }}
                        >
                            <FiPlus className="w-4 h-4" />
                            Adicionar Primeiro Prato
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>Nome</th>
                                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>Categoria</th>
                                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>Preço</th>
                                    <th className="text-left py-3 px-4 font-medium" style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>Status</th>
                                    <th className="text-right py-3 px-4 font-medium" style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dishes.map(dish => {
                                    const category = categories.find(c => c.$id === dish.categoryId)
                                    return (
                                        <tr key={dish.$id} className="border-b transition-colors"
                                            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                                        >
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="font-medium" style={{ color: 'var(--menu-text, #fff)' }}>{dish.name}</p>
                                                    <p className="text-sm line-clamp-1" style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>{dish.description}</p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4" style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>{category?.name || '-'}</td>
                                            <td className="py-3 px-4 font-medium" style={{ color: 'var(--menu-primary, #f59e0b)' }}>{formatPrice(dish.price)}</td>
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
                                                        className="p-2 rounded-lg transition-colors hover:bg-white/5"
                                                        style={{ color: 'var(--menu-text, #fff)', opacity: 0.7 }}
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteConfirmation(dish.$id)}
                                                        className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors"
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

            {/* DELETE CONFIRMATION MODAL */}
            {deleteConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDeleteConfirmation(null)}
                    />
                    <div
                        className="relative rounded-2xl border border-red-500/30 p-6 max-w-sm w-full animate-fade-in shadow-2xl shadow-red-500/10"
                        style={{ backgroundColor: 'var(--menu-bg, #09090b)' }}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                <FiAlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--menu-text, #fff)' }}>Excluir Prato?</h3>
                            <p className="mb-6" style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>
                                Tem certeza que deseja excluir este prato? Esta ação não pode ser desfeita.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteConfirmation(null)}
                                    className="flex-1 px-4 py-2 rounded-xl transition-colors hover:bg-white/10"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--menu-text, #fff)' }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
