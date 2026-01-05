'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
    FiShoppingBag,
    FiDollarSign,
    FiClock,
    FiChevronRight,
    FiPackage,
    FiList,
    FiPieChart,
    FiSettings,
    FiGrid,
    FiLayers,
    FiRefreshCw,
    FiAlertCircle,
    FiBell
} from 'react-icons/fi'
import { useMenuSettings } from '@/components/MenuThemeProvider'
import type { DashboardStats } from '@/types/orders'

export default function AdminDashboardPage() {
    const { settings } = useMenuSettings()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchStats()
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/reports?type=stats')
            if (!response.ok) throw new Error('Failed to fetch stats')
            const data = await response.json()
            setStats(data)
            setError(null)
        } catch (e) {
            console.error('Error fetching stats:', e)
            setError('Erro ao carregar estatísticas')
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price)
    }

    const quickActions = [
        {
            href: '/admin/orders',
            icon: FiPackage,
            label: 'Gerenciar Pedidos',
            description: 'Visualizar e atualizar status',
            color: 'from-amber-500 to-orange-600',
            badge: stats?.pendingOrders || 0
        },
        {
            href: '/admin/calls',
            icon: FiBell,
            label: 'Chamados',
            description: 'Atender solicitações de mesa',
            color: 'from-red-500 to-rose-600',
            badge: stats?.pendingWaiterCalls || 0
        },
        {
            href: '/admin/dishes',
            icon: FiList,
            label: 'Cardápio (Pratos)',
            description: 'Gerenciar pratos e categorias',
            color: 'from-blue-500 to-indigo-600'
        },
        {
            href: '/admin/reports',
            icon: FiPieChart,
            label: 'Relatórios',
            description: 'Análise de vendas e pedidos',
            color: 'from-emerald-500 to-green-600'
        },
        {
            href: '/admin/design',
            icon: FiSettings,
            label: 'Personalizar Design',
            description: 'Cores, logo e estilo do cardápio',
            color: 'from-purple-500 to-pink-600'
        },
        {
            href: '/admin/tables',
            icon: FiGrid,
            label: 'Mesas',
            description: 'Gerenciar mesas do restaurante',
            color: 'from-cyan-500 to-blue-600'
        },
        {
            href: '/admin/categories',
            icon: FiLayers,
            label: 'Categorias',
            description: 'Organizar categorias do cardápio',
            color: 'from-rose-500 to-red-600'
        }
    ]

    return (
        <div className="space-y-12 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-zinc-400 mt-1">Visão geral do restaurante</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                    <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar
                </button>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
                    <FiAlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">{error}</span>
                </div>
            )}

            {/* Stats Cards - Centralized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                    className="rounded-2xl border p-6"
                    style={{
                        background: `linear-gradient(135deg, ${settings?.primaryColor}15, ${settings?.secondaryColor}05)`,
                        borderColor: `${settings?.primaryColor}30`
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: `${settings?.primaryColor}20` }}>
                            <FiShoppingBag className="w-6 h-6" style={{ color: settings?.primaryColor }} />
                        </div>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Pedidos Hoje</p>
                    <p className="text-3xl font-bold text-white">
                        {loading ? '...' : stats?.todayOrders || 0}
                    </p>
                </div>

                <div
                    className="rounded-2xl border p-6"
                    style={{
                        background: `linear-gradient(135deg, ${settings?.secondaryColor}15, ${settings?.primaryColor}05)`,
                        borderColor: `${settings?.secondaryColor}30`
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: `${settings?.secondaryColor}20` }}>
                            <FiDollarSign className="w-6 h-6" style={{ color: settings?.secondaryColor }} />
                        </div>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Faturamento Hoje</p>
                    <p className="text-3xl font-bold text-white">
                        {loading ? '...' : formatPrice(stats?.todayRevenue || 0)}
                    </p>
                </div>

                <div
                    className="rounded-2xl border p-6"
                    style={{
                        background: `linear-gradient(135deg, ${settings?.primaryColor}15, ${settings?.secondaryColor}05)`,
                        borderColor: `${settings?.primaryColor}30`
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: `${settings?.primaryColor}20` }}>
                            <FiClock className="w-6 h-6" style={{ color: settings?.primaryColor }} />
                        </div>
                        {(stats?.pendingOrders || 0) > 0 && (
                            <span
                                className="text-black text-xs font-bold px-2 py-1 rounded-full animate-pulse"
                                style={{ backgroundColor: settings?.primaryColor }}
                            >
                                FILA
                            </span>
                        )}
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Pedidos Pendentes</p>
                    <p className="text-3xl font-bold text-white">
                        {loading ? '...' : stats?.pendingOrders || 0}
                    </p>
                </div>

                <div
                    className="rounded-2xl border p-6"
                    style={{
                        background: `linear-gradient(135deg, ${settings?.secondaryColor}15, ${settings?.primaryColor}05)`,
                        borderColor: `${settings?.secondaryColor}30`
                    }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl" style={{ backgroundColor: `${settings?.secondaryColor}20` }}>
                            <FiRefreshCw className="w-6 h-6" style={{ color: settings?.secondaryColor }} />
                        </div>
                    </div>
                    <p className="text-zinc-400 text-sm mb-1">Em Preparação</p>
                    <p className="text-3xl font-bold text-white">
                        {loading ? '...' : stats?.preparingOrders || 0}
                    </p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-6 text-center">Acesso Rápido</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="group relative bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 hover:border-zinc-700 transition-all duration-300 overflow-hidden"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                            <div className="relative flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 bg-gradient-to-r ${action.color} rounded-xl shadow-lg`}>
                                        <action.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-white group-hover:text-amber-400 transition-colors">
                                            {action.label}
                                        </h3>
                                        <p className="text-zinc-500 text-sm mt-1">{action.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {action.badge !== undefined && action.badge > 0 && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                                            {action.badge}
                                        </span>
                                    )}
                                    <FiChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Top Dishes - Centered */}
            {stats?.topDishes && stats.topDishes.length > 0 && (
                <div className="max-w-3xl mx-auto w-full">
                    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-8">
                        <h2 className="text-xl font-semibold text-white mb-6 text-center">🔥 Pratos Mais Pedidos Hoje</h2>
                        <ul className="space-y-4">
                            {stats.topDishes.map((dish, index) => (
                                <li key={dish.name} className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${index > 0 ? (index === 1 ? 'bg-zinc-400 text-black' : index === 2 ? 'text-white' : 'bg-zinc-700 text-zinc-400') : 'text-black'
                                                }`}
                                            style={index === 0 ? { backgroundColor: settings?.primaryColor } : index === 2 ? { backgroundColor: settings?.secondaryColor } : {}}
                                        >
                                            {index + 1}
                                        </span>
                                        <span className="text-white font-medium text-lg">{dish.name}</span>
                                    </div>
                                    <span className="text-zinc-400 font-medium">{dish.count} pedidos</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}
