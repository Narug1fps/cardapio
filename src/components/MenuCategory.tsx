'use client'

import { DishCard } from './DishCard'
import type { Category, Dish } from '@/types/menu'

interface MenuCategoryProps {
    category: Category
    dishes: Dish[]
}

export function MenuCategory({ category, dishes }: MenuCategoryProps) {
    const categoryDishes = dishes.filter(dish => dish.categoryId === category.$id)

    if (categoryDishes.length === 0) {
        return null
    }

    return (
        <section className="mb-12">
            <div className="mb-6">
                <h2
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{ color: 'var(--menu-text, #ffffff)' }}
                >
                    {category.name}
                </h2>
                {category.description && (
                    <p className="text-zinc-400">{category.description}</p>
                )}
                <div className="mt-3 h-1 w-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full" />
            </div>


            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                {categoryDishes.map(dish => (
                    <DishCard key={dish.$id} dish={dish} />
                ))}
            </div>
        </section >
    )
}
