'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { FaUpload, FaSpinner } from 'react-icons/fa'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { DishSchema, type CreateDishInput, type Category } from '@/types/menu'
import Image from 'next/image'




import { useMenuSettings } from '@/components/MenuThemeProvider'

export default function NewDishPage() {
    const { settings } = useMenuSettings()
    const router = useRouter()
    const { user, loading } = useAuth()
    const [categories, setCategories] = useState<Category[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState('')

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<CreateDishInput>({
        resolver: zodResolver(DishSchema),
        defaultValues: {
            available: true
        }
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
                    // Fix: Handle both array and object response
                    const categoriesList = Array.isArray(data) ? data : (data.categories || [])
                    setCategories(categoriesList)
                }
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }

        if (user) {
            fetchCategories()
        }
    }, [user])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const url = URL.createObjectURL(file)
            setImagePreview(url)
        }
    }

    const onSubmit = async (data: CreateDishInput) => {
        if (!user) return
        setIsSubmitting(true)
        setUploadError('')

        try {
            let imageUrl = null

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('dish-images')
                    .upload(filePath, imageFile)

                if (uploadError) {
                    throw new Error('Failed to upload image')
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('dish-images')
                    .getPublicUrl(filePath)

                imageUrl = publicUrl
            }

            const res = await fetch('/api/dishes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...data,
                    imageId: imageUrl
                })
            })

            if (!res.ok) throw new Error('Failed to create dish')

            router.push('/admin/dishes')
        } catch (error) {
            console.error(error)
            setUploadError('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <FaSpinner
                    className="w-8 h-8 animate-spin"
                    style={{ color: settings?.primaryColor || '#f59e0b' }}
                />
            </div>
        )
    }

    return (
        <div className="w-full">
            <div className="mb-8">
                <Link
                    href="/admin/dishes"
                    className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}
                >
                    <FiArrowLeft className="w-4 h-4" />
                    Voltar
                </Link>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--menu-text, #fff)' }}>Novo Prato</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
                <div className="card space-y-6 rounded-2xl p-6 border border-gray-700" style={{ backgroundColor: settings?.cardBackgroundColor || 'transparent' }}>
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--menu-text, #fff)', opacity: 0.8 }}>
                            Imagem do Prato
                        </label>
                        <div className="flex items-start gap-4">
                            <div className="w-32 h-32 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl">🍽️</span>
                                )}
                            </div>
                            <label className="flex-1 flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition-colors hover:opacity-80" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                <div className="flex flex-col items-center gap-2" style={{ color: 'var(--menu-text, #fff)', opacity: 0.6 }}>
                                    <FaUpload className="w-8 h-8" />
                                    <span className="text-sm">Clique para upload</span>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--menu-text, #000)', opacity: 0.8 }}>
                            Nome *
                        </label>
                        <input
                            type="text"
                            {...register('name')}
                            className="w-full rounded-lg border border-gray-600 p-3 bg-transparent text-black transition-colors focus:outline-none focus:ring-0"
                            style={{
                                color: 'var(--menu-text, #fff)',
                                outlineColor: settings?.primaryColor || '#f59e0b'
                            }}
                            placeholder="Ex: Filé Mignon ao Molho Madeira"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--menu-text, #fff)', opacity: 0.8 }}>
                            Descrição *
                        </label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full rounded-lg border border-gray-600 p-3 bg-transparent transition-colors focus:outline-none focus:ring-0"
                            style={{
                                color: settings?.textColor || '#fff',
                                outlineColor: settings?.primaryColor || '#f59e0b'
                            }}
                            placeholder="Descreva os ingredientes e preparo do prato"
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Price and Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--menu-text, #fff)', opacity: 0.8 }}>
                                Preço (R$) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('price')}
                                className="w-full rounded-lg border border-gray-600 p-3 bg-transparent transition-colors focus:outline-none focus:ring-0"
                                style={{
                                    color: 'var(--menu-text, #fff)',
                                    outlineColor: 'var(--menu-primary, #f59e0b)'
                                }}
                                placeholder="0,00"
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-400">{errors.price.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--menu-text, #fff)', opacity: 0.8 }}>
                                Categoria *
                            </label>
                            <select
                                {...register('categoryId')}
                                className="w-full rounded-lg border border-gray-600 p-3 bg-transparent transition-colors focus:outline-none focus:ring-0"
                                style={{
                                    color: 'var(--menu-text, #fff)',
                                    outlineColor: 'var(--menu-primary, #f59e0b)'
                                }}
                            >
                                <option value="" style={{ color: 'black' }}>Selecione...</option>
                                {categories.map(category => (
                                    <option key={category.$id} value={category.$id} style={{ color: 'black' }}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="mt-1 text-sm text-red-400">{errors.categoryId.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Available */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            {...register('available')}
                            id="available"
                            className="form-checkbox h-5 w-5 rounded border-gray-600 bg-transparent transition duration-150 ease-in-out focus:ring-0 focus:ring-offset-0"
                            style={{
                                color: settings?.primaryColor || '#f59e0b',
                            }}
                        />
                        <label htmlFor="available" style={{ color: 'var(--menu-text, #fff)', opacity: 0.8 }}>
                            Prato disponível
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Link
                            href="/admin/dishes"
                            className="px-6 py-2 rounded-lg transition-colors hover:bg-white/10"
                            style={{ color: 'var(--menu-text, #fff)', opacity: 0.8 }}
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: `linear-gradient(to right, ${settings?.primaryColor || '#f59e0b'}, ${settings?.secondaryColor || '#ea580c'})`,
                                color: '#fff'
                            }}
                        >
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="w-5 h-5 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <FiSave className="w-5 h-5" />
                                    Salvar Prato
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
