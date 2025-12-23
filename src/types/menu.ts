import { z } from 'zod'

export const DishSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.coerce.number().positive('Preço deve ser maior que zero'),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  available: z.boolean().default(true)
})

export interface Category {
  $id: string
  name: string
  description?: string
  order: number
  $createdAt?: string
  $updatedAt?: string
}

export interface Dish {
  $id: string
  name: string
  description: string
  price: number
  categoryId: string
  imageId?: string
  available: boolean
  $createdAt?: string
  $updatedAt?: string
}

export interface CreateDishInput {
  name: string
  description: string
  price: number
  categoryId: string
  imageId?: string
  available?: boolean
}

export interface UpdateDishInput {
  name?: string
  description?: string
  price?: number
  categoryId?: string
  imageId?: string
  available?: boolean
}

export interface CreateCategoryInput {
  name: string
  description?: string
  order?: number
}

export interface UpdateCategoryInput {
  name?: string
  description?: string
  order?: number
}
