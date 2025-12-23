'use client'

import Image from 'next/image'
import { FiCheck, FiX } from 'react-icons/fi'
import { FaUtensils } from 'react-icons/fa'
import type { Dish } from '@/types/menu'

interface DishCardProps {
    dish: Dish
}

export function DishCard({ dish }: DishCardProps) {
    const imageUrl = dish.imageId

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden  flex flex-col h-full">
            <div className="relative h-48 w-full bg-gray-100">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={dish.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                        <FaUtensils size={48} />
                    </div>
                )}

                {/* Availability Badge */}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${dish.available ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {dish.available ? (
                        <>
                            <FiCheck className="w-3 h-3" />
                            Disponível
                        </>
                    ) : (
                        <>
                            <FiX className="w-3 h-3" />
                            Indisponível
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-black mb-2 group-hover:text-amber-400 transition-colors">
                    {dish.name}
                </h3>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                    {dish.description}
                </p>
                <div className="flex items-center justify-between">
                    <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        {formatPrice(dish.price)}
                    </span>
                </div>
            </div>
        </div>
    )
}
