'use client'

import Image from 'next/image'
import { FiPlus, FiCheck, FiX } from 'react-icons/fi'
import { FaUtensils } from 'react-icons/fa'
import type { Dish } from '@/types/menu'
import { useCart } from '@/contexts/CartContext'
import { useState } from 'react'
import { useToast } from './Toast'

interface DishCardOrderProps {
    dish: Dish
    showPrices?: boolean
    showImages?: boolean
}

export function DishCardOrder({ dish, showPrices = true, showImages = true }: DishCardOrderProps) {
    const { addItem, items } = useCart()
    const [isAdding, setIsAdding] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const { success } = useToast()

    const imageUrl = dish.imageId

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price)
    }

    const itemInCart = items.find(item => item.dishId === dish.$id)
    const quantityInCart = itemInCart?.quantity || 0

    const handleAddToCart = () => {
        addItem(dish, quantity)
        setIsAdding(false)
        setQuantity(1)
        success(`${quantity}x ${dish.name} adicionado!`)
    }

    if (!dish.available) {
        return (
            <div
                className="overflow-hidden flex flex-col h-full opacity-60 relative"
                style={{
                    backgroundColor: 'var(--card-bg, #18181b)',
                    color: 'var(--card-text, #ffffff)',
                    borderRadius: 'var(--card-radius, 1rem)'
                }}
            >
                <div className="relative h-48 w-full bg-black/20">
                    {showImages && imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={dish.name}
                            fill
                            className="object-cover grayscale"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full opacity-20">
                            <FaUtensils size={48} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <span className="bg-red-500/90 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
                            <FiX className="w-4 h-4" />
                            Indisponível
                        </span>
                    </div>
                </div>
                <div className="p-4" style={{ padding: 'var(--card-padding, 1rem)' }}>
                    <h3 className="text-lg font-semibold opacity-60 mb-2">{dish.name}</h3>
                    <p className="opacity-50 text-sm mb-4 line-clamp-2">{dish.description}</p>
                    {showPrices && (
                        <span className="text-xl font-bold opacity-60">{formatPrice(dish.price)}</span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div
            className="overflow-hidden flex flex-col h-full group hover:shadow-xl transition-all duration-300"
            style={{
                backgroundColor: 'var(--card-bg, #18181b)',
                color: 'var(--card-text, #ffffff)',
                borderRadius: 'var(--card-radius, 1rem)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
        >
            {showImages && (
                <div className="relative h-48 w-full bg-black/10 overflow-hidden">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={dish.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full opacity-10">
                            <FaUtensils size={48} />
                        </div>
                    )}

                    {/* Quantity in cart badge */}
                    {quantityInCart > 0 && (
                        <div
                            className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg z-10"
                            style={{ backgroundColor: 'var(--menu-primary, #f59e0b)' }}
                        >
                            {quantityInCart} no pedido
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col" style={{ padding: 'var(--card-padding, 1rem)' }}>
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-lg font-semibold leading-tight">
                        {dish.name}
                    </h3>
                    {!showImages && quantityInCart > 0 && (
                        <div
                            className="shrink-0 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm"
                            style={{ backgroundColor: 'var(--menu-primary, #f59e0b)' }}
                        >
                            {quantityInCart}
                        </div>
                    )}
                </div>

                <p className="opacity-70 text-sm mb-4 line-clamp-2 flex-1">
                    {dish.description}
                </p>

                <div className="flex items-center justify-between gap-4 mt-auto">
                    {showPrices && (
                        <span
                            className="text-xl font-bold"
                            style={{ color: 'var(--menu-primary, #f59e0b)' }}
                        >
                            {formatPrice(dish.price)}
                        </span>
                    )}

                    {/* Add Button / Quantity Selector */}
                    {isAdding ? (
                        <div className="flex items-center gap-2 ml-auto animate-in fade-in slide-in-from-right-4 duration-200">
                            <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                                >
                                    -
                                </button>
                                <span className="w-6 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-md transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            <button
                                onClick={handleAddToCart}
                                className="p-2 text-white rounded-lg transition-colors shadow-lg"
                                style={{ backgroundColor: 'var(--menu-primary, #f59e0b)' }}
                            >
                                <FiCheck className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsAdding(false)
                                    setQuantity(1)
                                }}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="ml-auto flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                            style={{
                                background: 'linear-gradient(to right, var(--menu-primary, #f59e0b), var(--menu-secondary, #ea580c))'
                            }}
                        >
                            <FiPlus className="w-4 h-4" />
                            <span className="font-medium">Adicionar</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
