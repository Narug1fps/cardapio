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
import type { DailyReport } from '@/types/orders'

export default function AdminReportsPage() {
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
                <h1 className="text-3xl font-bold text-white">Relatórios</h1>
                <p className="text-zinc-400 mt-1">Análise de vendas e pedidos</p>
            </div>

            {/* Date Range Selector */}
            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
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
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                                    }`}
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
                                className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                            />
                        </div>
                        <span className="text-zinc-500">até</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-2xl border border-emerald-500/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            <FiDollarSign className="w-6 h-6 text-emerald-400" />
                        </div>
                        <span className="text-zinc-400 text-sm">Faturamento Total</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{formatPrice(totalRevenue)}</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-2xl border border-blue-500/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <FiShoppingBag className="w-6 h-6 text-blue-400" />
                        </div>
                        <span className="text-zinc-400 text-sm">Total de Pedidos</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalOrders}</p>
                </div>

                <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl border border-amber-500/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-amber-500/20 rounded-xl">
                            <FiBarChart2 className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="text-zinc-400 text-sm">Ticket Médio</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{formatPrice(avgOrderValue)}</p>
                </div>

                <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-2xl border border-red-500/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <FiX className="w-6 h-6 text-red-400" />
                        </div>
                        <span className="text-zinc-400 text-sm">Cancelamentos</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{totalCancelled}</p>
                </div>
            </div>

            {/* Best and Worst Days */}
            {reports.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bestDay && (
                        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-emerald-500/20 rounded-xl">
                                    <FiTrendingUp className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <span className="text-zinc-400 text-sm block">Melhor Dia</span>
                                    <span className="text-white font-medium">{formatDate(bestDay.reportDate)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-zinc-500 text-sm">Faturamento</p>
                                    <p className="text-xl font-bold text-emerald-400">{formatPrice(bestDay.totalRevenue)}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-sm">Pedidos</p>
                                    <p className="text-xl font-bold text-white">{bestDay.totalOrders}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {worstDay && reports.length > 1 && (
                        <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-500/20 rounded-xl">
                                    <FiTrendingDown className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <span className="text-zinc-400 text-sm block">Pior Dia</span>
                                    <span className="text-white font-medium">{formatDate(worstDay.reportDate)}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-zinc-500 text-sm">Faturamento</p>
                                    <p className="text-xl font-bold text-red-400">{formatPrice(worstDay.totalRevenue)}</p>
                                </div>
                                <div>
                                    <p className="text-zinc-500 text-sm">Pedidos</p>
                                    <p className="text-xl font-bold text-white">{worstDay.totalOrders}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Daily Chart */}
            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <FiBarChart2 className="w-5 h-5 text-amber-400" />
                    Faturamento Diário
                </h2>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
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
                                            className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-md transition-all duration-300 hover:from-amber-500 hover:to-amber-300"
                                            style={{ height: `${Math.max(height, 4)}%`, minHeight: '8px' }}
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
            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 overflow-hidden">
                <div className="p-6 border-b border-zinc-800">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <FiPieChart className="w-5 h-5 text-amber-400" />
                        Detalhamento por Dia
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left px-6 py-4 text-zinc-500 font-medium">Data</th>
                                <th className="text-right px-6 py-4 text-zinc-500 font-medium">Pedidos</th>
                                <th className="text-right px-6 py-4 text-zinc-500 font-medium">Faturamento</th>
                                <th className="text-right px-6 py-4 text-zinc-500 font-medium">Ticket Médio</th>
                                <th className="text-right px-6 py-4 text-zinc-500 font-medium">Cancelados</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map(report => (
                                <tr key={report.reportDate} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
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
