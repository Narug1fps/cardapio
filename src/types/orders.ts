import { z } from 'zod'

// Order Status Types
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'

export const OrderStatusLabels: Record<OrderStatus, string> = {
    pending: 'Pendente',
    preparing: 'Preparando',
    ready: 'Pronto',
    delivered: 'Entregue',
    cancelled: 'Cancelado'
}

export const OrderStatusColors: Record<OrderStatus, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    preparing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    ready: 'bg-green-500/20 text-green-400 border-green-500/30',
    delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
}

// Waiter Call Status
export type WaiterCallStatus = 'pending' | 'acknowledged' | 'completed'

export interface WaiterCall {
    id: string
    tableNumber: number
    tableName?: string
    type: 'bill' | 'assistance' | 'order_ready'
    status: WaiterCallStatus
    customerName?: string
    notes?: string
    createdAt: string
    acknowledgedAt?: string
    completedAt?: string
}

// Table Types
export interface Table {
    id: string
    number: number
    name?: string
    seats: number
    isActive: boolean
    qrCode?: string
    createdAt?: string
}

// Order Item Types
export interface OrderItem {
    id: string
    orderId: string
    dishId: string
    dishName: string
    quantity: number
    unitPrice: number
    totalPrice: number
    notes?: string
    createdAt?: string
}

export interface CartItem {
    dishId: string
    dishName: string
    quantity: number
    unitPrice: number
    notes?: string
    imageUrl?: string
}

// Order Types
export interface Order {
    id: string
    tableId?: string
    tableNumber: number
    status: OrderStatus
    total: number
    notes?: string
    customerName?: string
    estimatedTime: number
    completedAt?: string
    createdAt: string
    updatedAt: string
    items?: OrderItem[]
}

// Create Order Input
export const CreateOrderSchema = z.object({
    tableNumber: z.number().min(1, 'Número da mesa é obrigatório'),
    customerName: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
        dishId: z.string(),
        dishName: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number().positive(),
        notes: z.string().optional()
    })).min(1, 'Adicione pelo menos um item ao pedido')
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>

// Menu Settings Types - Extended with card customization
export interface MenuSettings {
    id: string
    restaurantName: string
    logoUrl?: string
    bannerUrl?: string  // Image below restaurant name
    primaryColor: string
    secondaryColor: string
    accentColor: string
    backgroundColor: string
    textColor: string
    fontFamily: string
    showPrices: boolean
    showImages: boolean
    currency: string
    welcomeMessage: string
    footerText?: string
    // Card customization
    cardBackgroundColor: string
    cardTextColor: string
    cardBorderRadius: 'small' | 'medium' | 'large' | 'full'
    cardSize: 'compact' | 'normal' | 'large'
    createdAt?: string
    updatedAt?: string
}

export const MenuSettingsSchema = z.object({
    restaurantName: z.string().min(1, 'Nome do restaurante é obrigatório'),
    logoUrl: z.string().optional(),
    bannerUrl: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
    textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
    fontFamily: z.string().min(1),
    showPrices: z.boolean(),
    showImages: z.boolean(),
    currency: z.string().min(1),
    welcomeMessage: z.string().optional(),
    footerText: z.string().optional(),
    cardBackgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
    cardTextColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
    cardBorderRadius: z.enum(['small', 'medium', 'large', 'full']),
    cardSize: z.enum(['compact', 'normal', 'large'])
})

export type MenuSettingsInput = z.infer<typeof MenuSettingsSchema>

// Daily Report Types
export interface DailyReport {
    id: string
    reportDate: string
    totalOrders: number
    totalRevenue: number
    cancelledOrders: number
    averageOrderValue: number
    mostOrderedDishId?: string
    mostOrderedDishName?: string
    createdAt?: string
}

// Dashboard Stats - Without percentages
export interface DashboardStats {
    todayOrders: number
    todayRevenue: number
    pendingOrders: number
    preparingOrders: number
    averageOrderTime: number
    topDishes: { name: string; count: number }[]
    pendingWaiterCalls: number
}
