'use client'

import { DishCardOrder } from './DishCardOrder'
import type { Category, Dish } from '@/types/menu'

interface MenuCategoryOrderProps {
    category: Category
    dishes: Dish[]
    showPrices?: boolean
    showImages?: boolean
}

export function MenuCategoryOrder({
    category,
    dishes,
    showPrices = true,
    showImages = true
}: MenuCategoryOrderProps) {
    const categoryDishes = dishes.filter(dish => dish.categoryId === category.$id)

    if (categoryDishes.length === 0) {
        return null
    }

    return (
        <section className="mb-12">
            <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {category.name}
                </h2>
                {category.description && (
                    <p className="text-zinc-400">{category.description}</p>
                )}
                <div
                    className="mt-3 h-1 w-20 rounded-full"
                    style={{
                        background: 'linear-gradient(to right, var(--menu-primary, #f59e0b), var(--menu-secondary, #ea580c))'
                    }}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryDishes.map(dish => (
                    <DishCardOrder
                        key={dish.$id}
                        dish={dish}
                        showPrices={showPrices}
                        showImages={showImages}
                    />
                ))}
            </div>
        </section>
    )
}
