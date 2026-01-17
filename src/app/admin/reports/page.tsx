'use client'

import { useState, useEffect } from 'react'
import {
    FiCalendar,
    FiDollarSign,
    FiShoppingBag,
    FiTrendingUp,
    FiTrendingDown,
    FiBarChart2,
    FiPieChart,
    FiX
} from 'react-icons/fi'
import { useMenuSettings } from '@/components/MenuThemeProvider'
import type { DailyReport } from '@/types/orders'

export default function AdminReportsPage() {
    const { settings } = useMenuSettings()
    const [reports, setReports] = useState<DailyReport[]>([])
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState({
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    })
    const [quickRange, setQuickRange] = useState('7days')

    useEffect(() => {
        fetchReports()
    }, [dateRange])

    const fetchReports = async () => {
        setLoading(true)
        try {
            const response = await fetch(
                `/api/reports?type=range&startDate=${dateRange.start}&endDate=${dateRange.end}`
            )
            if (response.ok) {
                const data = await response.json()
                setReports(data)
            }
        } catch (error) {
            console.error('Error fetching reports:', error)
        } finally {
            setLoading(false)
        }
    }

    const setQuickDateRange = (range: string) => {
        setQuickRange(range)
        const end = new Date()
        let start = new Date()

        switch (range) {
            case '7days':
                start.setDate(end.getDate() - 7)
                break
            case '30days':
                start.setDate(end.getDate() - 30)
                break
            case 'thisMonth':
                start = new Date(end.getFullYear(), end.getMonth(), 1)
                break
            case 'lastMonth':
                start = new Date(end.getFullYear(), end.getMonth() - 1, 1)
                end.setDate(0) // Last day of previous month
                break
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        })
    }

    // Calculate summary stats
    const totalOrders = reports.reduce((sum, r) => sum + r.totalOrders, 0)
    const totalRevenue = reports.reduce((sum, r) => sum + r.totalRevenue, 0)
    const totalCancelled = reports.reduce((sum, r) => sum + r.cancelledOrders, 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Find best and worst days
    const bestDay = reports.reduce((best, current) =>
        current.totalRevenue > (best?.totalRevenue || 0) ? current : best,
        reports[0]
    )
    const worstDay = reports.reduce((worst, current) =>
        current.totalRevenue < (worst?.totalRevenue || Infinity) ? current : worst,
        reports[0]
    )

    // Calculate max revenue for chart scaling
    const maxRevenue = Math.max(...reports.map(r => r.totalRevenue), 1)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold" style={{ color: settings?.textColor || '#ffffff' }}>Relatórios</h1>
                <p className="mt-1" style={{ color: settings?.textColor || '#a1a1aa', opacity: 0.6 }}>Análise de vendas e pedidos</p>
            </div>

            {/* Date Range Selector */}
            <div
                className="rounded-2xl p-6"
                style={{ backgroundColor: settings?.cardBackgroundColor || 'rgba(24, 24, 27, 0.5)' }}
            >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: '7days', label: 'Últimos 7 dias' },
                            { value: '30days', label: 'Últimos 30 dias' },
                            { value: 'thisMonth', label: 'Este mês' },
                            { value: 'lastMonth', label: 'Mês passado' }
                        ].map(option => (
                            <button
                                key={option.value}
                                onClick={() => setQuickDateRange(option.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${quickRange === option.value
                                    ? 'text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    }`}
                                style={quickRange === option.value ? {
                                    backgroundColor: settings?.primaryColor || '#f59e0b'
                                } : {}}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <FiCalendar className="w-4 h-4 text-zinc-500" />
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm"
                                style={{ color: 'var(--menu-text)' }}
                            />
                        </div>
                        <span className="text-zinc-500">até</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm"
                            style={{ color: 'var(--menu-text)' }}
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div
                    className="rounded-2xl p-6"
                    style={{ backgroundColor: settings?.cardBackgroundColor || 'rgba(24, 24, 27, 0.5)' }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="p-3 rounded-xl"
                            style={{ backgroundColor: `${settings?.secondaryColor || '#ea580c'}33` }}
                        >
                            <FiDollarSign
                                className="w-6 h-6"
                                style={{ color: settings?.secondaryColor || '#ea580c' }}
                            />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--menu-text-secondary)' }}>Faturamento Total</span>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: settings?.textColor || '#ffffff' }}>{formatPrice(totalRevenue)}</p>
                </div>

                <div
                    className="rounded-2xl p-6"
                    style={{ backgroundColor: settings?.cardBackgroundColor || 'rgba(24, 24, 27, 0.5)' }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="p-3 rounded-xl"
                            style={{ backgroundColor: `${settings?.primaryColor || '#f59e0b'}33` }}
                        >
                            <FiShoppingBag
                                className="w-6 h-6"
                                style={{ color: settings?.primaryColor || '#f59e0b' }}
                            />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--menu-text-secondary)' }}>Total de Pedidos</span>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: settings?.textColor || '#ffffff' }}>{totalOrders}</p>
                </div>

                <div
                    className="rounded-2xl p-6"
                    style={{ backgroundColor: settings?.cardBackgroundColor || 'rgba(24, 24, 27, 0.5)' }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="p-3 rounded-xl"
                            style={{ backgroundColor: `${settings?.primaryColor || '#f59e0b'}33` }}
                        >
                            <FiBarChart2
                                className="w-6 h-6"
                                style={{ color: settings?.primaryColor || '#f59e0b' }}
                            />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--menu-text-secondary)' }}>Ticket Médio</span>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: settings?.textColor || '#ffffff' }}>{formatPrice(avgOrderValue)}</p>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <FiX className="w-6 h-6 text-red-400" />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--menu-text-secondary)' }}>Cancelamentos</span>
                    </div>
                    <p className="text-3xl font-bold" style={{ color: settings?.textColor || '#ffffff' }}>{totalCancelled}</p>
                </div>
            </div>

            {/* Best and Worst Days */}
            {reports.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bestDay && (
                        <div
                            className="rounded-2xl p-6"
                            style={{ backgroundColor: settings?.cardBackgroundColor || 'rgba(24, 24, 27, 0.5)' }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-500/20 rounded-xl">
                                    <FiTrendingUp className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <span className="text-sm block" style={{ color: 'var(--menu-text-secondary)' }}>Melhor Dia</span>
                                    <span className="text-white font-medium">{formatDate(bestDay.reportDate)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--menu-text-secondary)' }}>Faturamento</p>
                                    <p className="text-xl font-bold text-emerald-400">{formatPrice(bestDay.totalRevenue)}</p>
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--menu-text-secondary)' }}>Pedidos</p>
                                    <p className="text-xl font-bold text-white">{bestDay.totalOrders}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {worstDay && reports.length > 1 && (
                        <div
                            className="rounded-2xl p-6"
                            style={{ backgroundColor: settings?.cardBackgroundColor || 'rgba(24, 24, 27, 0.5)' }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-500/20 rounded-xl">
                                    <FiTrendingDown className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <span className="text-sm block" style={{ color: 'var(--menu-text-secondary)' }}>Pior Dia</span>
                                    <span className="text-white font-medium">{formatDate(worstDay.reportDate)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--menu-text-secondary)' }}>Faturamento</p>
                                    <p className="text-xl font-bold text-red-400">{formatPrice(worstDay.totalRevenue)}</p>
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: 'var(--menu-text-secondary)' }}>Pedidos</p>
                                    <p className="text-xl font-bold text-white">{worstDay.totalOrders}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Daily Chart */}
            <div
                className="rounded-2xl p-6"
                style={{ backgroundColor: settings?.cardBackgroundColor || 'rgba(24, 24, 27, 0.5)' }}
            >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--menu-text)' }}>
                    <FiBarChart2 className="w-5 h-5 type-amber-400" style={{ color: settings?.primaryColor || '#f59e0b' }} />
                    Faturamento Diário
                </h2>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div
                            className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
                            style={{ borderColor: settings?.primaryColor || '#f59e0b' }}
                        ></div>
                    </div>
                ) : reports.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-zinc-500">
                        Nenhum dado encontrado para o período selecionado
                    </div>
                ) : (
                    <div className="h-64 flex items-end gap-2">
                        {reports.map(report => {
                            const height = (report.totalRevenue / maxRevenue) * 100
                            return (
                                <div
                                    key={report.reportDate}
                                    className="flex-1 flex flex-col items-center gap-2 group"
                                >
                                    <div className="relative w-full flex flex-col items-center">
                                        {/* Tooltip */}
                                        <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                                            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-2 text-xs whitespace-nowrap">
                                                <p className="text-white font-medium">{formatDate(report.reportDate)}</p>
                                                <p className="text-amber-400">{formatPrice(report.totalRevenue)}</p>
                                                <p className="text-zinc-400">{report.totalOrders} pedidos</p>
                                            </div>
                                        </div>
                                        {/* Bar */}
                                        <div
                                            className="w-full rounded-t-md transition-all duration-300"
                                            style={{
                                                height: `${Math.max(height, 4)}%`,
                                                minHeight: '8px',
                                                background: `linear-gradient(to top, ${settings?.primaryColor || '#d97706'}, ${settings?.secondaryColor || '#fbbf24'})`
                                            }}
                                        />
                                    </div>
                                    <span className="text-zinc-600 text-xs hidden md:block">
                                        {new Date(report.reportDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit' })}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Daily Table */}
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: settings?.cardBackgroundColor || 'rgba(24, 24, 27, 0.5)' }}>
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FiPieChart className="w-5 h-5 text-amber-400" />
                        Detalhamento por Dia
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="text-left px-6 py-4 font-medium" style={{ color: 'var(--menu-text-secondary)' }}>Data</th>
                                <th className="text-right px-6 py-4 font-medium" style={{ color: 'var(--menu-text-secondary)' }}>Pedidos</th>
                                <th className="text-right px-6 py-4 font-medium" style={{ color: 'var(--menu-text-secondary)' }}>Faturamento</th>
                                <th className="text-right px-6 py-4 font-medium" style={{ color: 'var(--menu-text-secondary)' }}>Ticket Médio</th>
                                <th className="text-right px-6 py-4 font-medium" style={{ color: 'var(--menu-text-secondary)' }}>Cancelados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report.reportDate} className="hover:bg-zinc-800/30">
                                    <td className="px-6 py-4 text-white font-medium">{formatDate(report.reportDate)}</td>
                                    <td className="px-6 py-4 text-right text-zinc-400">{report.totalOrders}</td>
                                    <td className="px-6 py-4 text-right text-amber-400 font-medium">{formatPrice(report.totalRevenue)}</td>
                                    <td className="px-6 py-4 text-right text-zinc-400">{formatPrice(report.averageOrderValue)}</td>
                                    <td className="px-6 py-4 text-right text-red-400">{report.cancelledOrders}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
