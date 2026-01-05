'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import type { CartItem } from '@/types/orders'
import type { Dish } from '@/types/menu'

// Função para obter valor inicial do localStorage de forma síncrona
const getInitialTableNumber = (): number | null => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('tableNumber')
    if (saved) {
        const parsed = parseInt(saved, 10)
        return !isNaN(parsed) ? parsed : null
    }
    return null
}

const getInitialCustomerName = (): string => {
    if (typeof window === 'undefined') return ''
    return localStorage.getItem('customerName') || ''
}

const getInitialCart = (): CartItem[] => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('cart')
    if (saved) {
        try {
            return JSON.parse(saved)
        } catch {
            return []
        }
    }
    return []
}

interface CartContextType {
    items: CartItem[]
    tableNumber: number | null
    customerName: string
    addItem: (dish: Dish, quantity?: number, notes?: string) => void
    removeItem: (dishId: string) => void
    updateQuantity: (dishId: string, quantity: number) => void
    updateNotes: (dishId: string, notes: string) => void
    clearCart: () => void
    setTableNumber: (number: number) => void
    setCustomerName: (name: string) => void
    getTotal: () => number
    getItemCount: () => number
    syncFromLocalStorage: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    // Inicialização síncrona do localStorage para evitar dessincronização
    const [items, setItems] = useState<CartItem[]>(getInitialCart)
    const [tableNumber, setTableNumberState] = useState<number | null>(getInitialTableNumber)
    const [customerName, setCustomerName] = useState(getInitialCustomerName)
    const [isHydrated, setIsHydrated] = useState(false)

    // Marcar como hidratado após a montagem e sincronizar novamente
    useEffect(() => {
        // Re-sincronizar do localStorage após hidratação para garantir valores corretos
        const savedTable = localStorage.getItem('tableNumber')
        const savedName = localStorage.getItem('customerName')
        const savedCart = localStorage.getItem('cart')

        if (savedTable) {
            const parsed = parseInt(savedTable, 10)
            if (!isNaN(parsed) && parsed !== tableNumber) {
                console.log(`[CartContext] Sincronizando mesa do localStorage: ${parsed}`)
                setTableNumberState(parsed)
            }
        }
        if (savedName && savedName !== customerName) {
            setCustomerName(savedName)
        }
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart)
                if (JSON.stringify(parsedCart) !== JSON.stringify(items)) {
                    setItems(parsedCart)
                }
            } catch (e) {
                console.error('Failed to parse cart:', e)
            }
        }
        setIsHydrated(true)
    }, [])

    // Função para sincronizar manualmente do localStorage
    const syncFromLocalStorage = useCallback(() => {
        const savedTable = localStorage.getItem('tableNumber')
        if (savedTable) {
            const parsed = parseInt(savedTable, 10)
            if (!isNaN(parsed)) {
                setTableNumberState(parsed)
            }
        }
    }, [])

    // Save cart to localStorage on change
    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('cart', JSON.stringify(items))
        }
    }, [items, isHydrated])

    useEffect(() => {
        if (isHydrated && tableNumber !== null) {
            localStorage.setItem('tableNumber', tableNumber.toString())
        }
    }, [tableNumber, isHydrated])

    useEffect(() => {
        if (isHydrated) {
            localStorage.setItem('customerName', customerName)
        }
    }, [customerName, isHydrated])

    const setTableNumber = (number: number) => {
        // Always update localStorage first to avoid race conditions
        localStorage.setItem('tableNumber', number.toString())

        // If changing tables (and not just initializing), clear the cart
        if (tableNumber !== null && tableNumber !== number) {
            console.log(`[CartContext] Mesa alterada de ${tableNumber} para ${number}. Limpando carrinho.`)
            setItems([])
            localStorage.removeItem('cart')
        }

        console.log(`[CartContext] setTableNumber chamado: ${number}`)
        setTableNumberState(number)
    }

    const addItem = (dish: Dish, quantity = 1, notes = '') => {
        setItems(prev => {
            const existingIndex = prev.findIndex(item => item.dishId === dish.$id)

            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: updated[existingIndex].quantity + quantity
                }
                return updated
            }

            return [...prev, {
                dishId: dish.$id,
                dishName: dish.name,
                quantity,
                unitPrice: dish.price,
                notes,
                imageUrl: dish.imageId
            }]
        })
    }

    const removeItem = (dishId: string) => {
        setItems(prev => prev.filter(item => item.dishId !== dishId))
    }

    const updateQuantity = (dishId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(dishId)
            return
        }
        setItems(prev => prev.map(item =>
            item.dishId === dishId ? { ...item, quantity } : item
        ))
    }

    const updateNotes = (dishId: string, notes: string) => {
        setItems(prev => prev.map(item =>
            item.dishId === dishId ? { ...item, notes } : item
        ))
    }

    const clearCart = () => {
        setItems([])
        localStorage.removeItem('cart')
    }

    const getTotal = () => {
        return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    }

    const getItemCount = () => {
        return items.reduce((sum, item) => sum + item.quantity, 0)
    }

    return (
        <CartContext.Provider value={{
            items,
            tableNumber,
            customerName,
            addItem,
            removeItem,
            updateQuantity,
            updateNotes,
            clearCart,
            setTableNumber,
            setCustomerName: (name) => setCustomerName(name),
            getTotal,
            getItemCount,
            syncFromLocalStorage
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
