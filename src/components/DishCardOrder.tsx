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

    // Card inativo/indisponível
    if (!dish.available) {
        return (
            <div className="flex flex-col h-full rounded-2xl bg-white shadow-sm opacity-60 relative overflow-hidden">
                <div className="relative h-32 md:h-40 w-full bg-[#3F3E43] shrink-0">
                    {showImages && imageUrl ? (
                        <Image src={imageUrl} alt={dish.name} fill className="object-cover grayscale" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-white/20">
                            <FiPlus className="rotate-45 w-8 h-8" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-white/10 flex items-center justify-center z-10">
                        <span className="bg-zinc-800 text-white px-3 py-1 rounded-full text-xs font-medium">Indisponível</span>
                    </div>
                </div>
                <div className="p-3 md:p-4 flex flex-col flex-1">
                    <h3 className="font-serif font-semibold text-black text-sm md:text-base leading-tight mb-2 line-clamp-2">
                        {dish.name}
                    </h3>
                    <p className="font-serif text-[#666] text-sm mt-auto">
                        {showPrices ? formatPrice(dish.price) : '-'}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div
            className="flex flex-col h-full rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden relative group"
            style={{
                backgroundColor: 'var(--card-bg, #ffffff)',
                borderRadius: 'var(--card-radius, 1rem)'
            }}
        >
            {showImages && (
                <div className="relative w-full shrink-0 h-36 md:h-48">
                    <div className="absolute inset-0 h-full w-full">
                        {imageUrl ? (
                            <Image
                                src={imageUrl}
                                alt={dish.name}
                                fill
                                className="object-cover transition-transform duration-500 hover:scale-105"
                            />
                        ) : (
                            <div
                                className="flex items-center justify-center h-full w-full"
                                style={{ backgroundColor: '#3F3E43' }}
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                            </div>
                        )}
                    </div>

                    {quantityInCart > 0 && (
                        <div className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-md z-10">
                            {quantityInCart} no pedido
                        </div>
                    )}
                </div>
            )}

            {/* Content Body */}
            <div className="flex-1 flex flex-col p-3 md:p-4 justify-between bg-white">

                {/* Title */}
                <h3
                    className="font-serif font-medium text-black text-sm md:text-base leading-snug mb-2 line-clamp-2"
                    style={{ color: 'var(--card-text, #000000)' }}
                >
                    {dish.name}
                </h3>

                {/* Description - REINSERIDA */}
                <p
                    className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed"
                    style={{ color: 'var(--card-text-secondary, #666666)' }}
                >
                    {dish.description}
                </p>

                {/* Bottom Section: Price left, Button right */}
                <div className="flex items-end justify-between mt-auto">
                    {showPrices && (
                        <span className="font-serif text-[#666] text-sm md:text-base mb-1">
                            {formatPrice(dish.price)}
                        </span>
                    )}

                    {isAdding ? (
                        <div className="flex items-center bg-black rounded-lg p-0.5 gap-1 animate-in fade-in zoom-in duration-200">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-6 h-6 flex items-center justify-center text-white hover:text-gray-300 font-bold"
                            >
                                -
                            </button>
                            <span className="text-white text-xs font-bold w-4 text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-white hover:text-gray-300 font-bold"
                            >
                                +
                            </button>
                            <button
                                onClick={handleAddToCart}
                                className="w-6 h-6 flex items-center justify-center bg-white/20 rounded text-white hover:bg-white/30 ml-0.5"
                            >
                                <FiCheck size={12} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="bg-black hover:bg-zinc-800 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-colors shadow-sm"
                            aria-label="Adicionar"
                        >
                            <FiPlus size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
