'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi'
import { FaSpinner } from 'react-icons/fa'
import { useAuth } from '@/contexts/AuthContext'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import type { Category } from '@/types/menu'

const categorySchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    description: z.string().optional()
})

type CategoryForm = z.infer<typeof categorySchema>

export default function CategoriesPage() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const [categories, setCategories] = useState<Category[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<CategoryForm>({
        resolver: zodResolver(categorySchema)
    })

    useEffect(() => {
        if (!loading && !user) {
            router.push('/admin/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories')
                if (res.ok) {
                    const data = await res.json()
                    setCategories(data.categories || [])
                }
            } catch (error) {
                console.error('Error fetching categories:', error)
            } finally {
                setLoadingData(false)
            }
        }

        if (user) {
            fetchCategories()
        }
    }, [user])

    const openNewForm = () => {
        reset({ name: '', description: '' })
        setEditingId(null)
        setShowForm(true)
    }

    const openEditForm = (category: Category) => {
        reset({ name: category.name, description: category.description || '' })
        setEditingId(category.$id)
        setShowForm(true)
    }

    const closeForm = () => {
        setShowForm(false)
        setEditingId(null)
        reset({ name: '', description: '' })
    }

    const onSubmit = async (data: CategoryForm) => {
        setIsSubmitting(true)

        try {
            if (editingId) {
                // Update
                const res = await fetch(`/api/categories/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })

                if (res.ok) {
                    const result = await res.json()
                    setCategories(categories.map(c =>
                        c.$id === editingId ? result.category : c
                    ))
                }
            } else {
                // Create
                const res = await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })

                if (res.ok) {
                    const result = await res.json()
                    setCategories([...categories, result.category])
                }
            }

            closeForm()
        } catch (error) {
            console.error('Error saving category:', error)
            alert('Erro ao salvar categoria')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

        try {
            const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setCategories(categories.filter(c => c.$id !== id))
            }
        } catch (error) {
            console.error('Error deleting category:', error)
        }
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
                        <h1 className="text-3xl font-bold text-white mb-2">Categorias</h1>
                        <p className="text-zinc-400">Gerencie as categorias do cardápio</p>
                    </div>
                    <button onClick={openNewForm} className="btn btn-primary">
                        <FiPlus className="w-4 h-4" />
                        Nova Categoria
                    </button>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="card w-full max-w-md animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white">
                                    {editingId ? 'Editar Categoria' : 'Nova Categoria'}
                                </h2>
                                <button
                                    onClick={closeForm}
                                    className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Nome *
                                    </label>
                                    <input
                                        type="text"
                                        {...register('name')}
                                        className="w-full"
                                        placeholder="Ex: Entradas"
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Descrição
                                    </label>
                                    <textarea
                                        {...register('description')}
                                        rows={2}
                                        className="w-full"
                                        placeholder="Descrição opcional"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={closeForm} className="btn btn-secondary">
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={isSubmitting} className="btn btn-primary">
                                        {isSubmitting ? (
                                            <>
                                                <FaSpinner className="w-4 h-4 animate-spin" />
                                                Salvando...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheck className="w-4 h-4" />
                                                Salvar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Categories List */}
                <div className="card">
                    {loadingData ? (
                        <div className="flex items-center justify-center py-12">
                            <FaSpinner className="w-6 h-6 animate-spin text-amber-500" />
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-zinc-400 mb-4">Nenhuma categoria cadastrada</p>
                            <button onClick={openNewForm} className="btn btn-primary">
                                <FiPlus className="w-4 h-4" />
                                Adicionar Primeira Categoria
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((category, index) => (
                                <div
                                    key={category.$id}
                                    className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <h3 className="text-white font-medium">{category.name}</h3>
                                            {category.description && (
                                                <p className="text-zinc-400 text-sm">{category.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openEditForm(category)}
                                            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category.$id)}
                                            className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
