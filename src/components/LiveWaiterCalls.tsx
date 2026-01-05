'use client'

import { useState, useEffect } from 'react'
import { FiBell, FiCheck, FiClock } from 'react-icons/fi'
import { WaiterCall } from '@/types/orders'
import { useToast } from '@/components/Toast'

export function LiveWaiterCalls() {
    const [calls, setCalls] = useState<WaiterCall[]>([])
    const [loading, setLoading] = useState(true)
    const { success, error } = useToast()

    useEffect(() => {
        fetchCalls()
        const interval = setInterval(fetchCalls, 15000)
        return () => clearInterval(interval)
    }, [])

    const fetchCalls = async () => {
        try {
            const response = await fetch('/api/waiter-calls?status=pending')

            if (!response.ok) {
                throw new Error('Failed to fetch calls')
            }

            const data = await response.json()

            if (Array.isArray(data)) {
                // Map snake_case from DB to camelCase for frontend
                const formattedCalls: WaiterCall[] = data.map((item: any) => ({
                    id: item.id,
                    tableNumber: item.table_number,
                    type: item.type,
                    status: item.status,
                    customerName: item.customer_name,
                    notes: item.notes,
                    createdAt: item.created_at,
                    acknowledgedAt: item.acknowledged_at,
                    completedAt: item.completed_at
                }))
                setCalls(formattedCalls)
            } else {
                console.error('Invalid data format received for waiter calls:', data)
                setCalls([])
            }
        } catch (e) {
            console.error('Error fetching waiter calls:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleAcknowledge = async (id: string, tableNumber: number) => {
        try {
            const response = await fetch('/api/waiter-calls', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: 'completed' })
            })

            if (response.ok) {
                setCalls(prev => prev.filter(call => call.id !== id))
                success(`Chamado da Mesa ${tableNumber} atendido`)
            } else {
                throw new Error('Failed to update')
            }
        } catch (e) {
            error('Erro ao atender chamado')
        }
    }

    const formatTime = (isoString?: string) => {
        if (!isoString) return ''
        const date = new Date(isoString)
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }

    const getCallTypeLabel = (type: string) => {
        switch (type) {
            case 'bill': return 'Conta'
            case 'assistance': return 'Ajuda'
            case 'order_ready': return 'Pedido Pronto'
            default: return 'Geral'
        }
    }

    if (loading && calls.length === 0) return null

    if (calls.length === 0) {
        return (
            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 flex flex-col items-center justify-center text-center">
                <div className="p-3 bg-zinc-800 rounded-full mb-3">
                    <FiBell className="w-6 h-6 text-zinc-600" />
                </div>
                <h3 className="text-white font-medium">Nenhum chamado pendente</h3>
                <p className="text-zinc-500 text-sm mt-1">Todos os clientes estão atendidos</p>
            </div>
        )
    }

    return (
        <div className="bg-zinc-900/50 rounded-2xl border border-red-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FiBell className="w-5 h-5 text-red-500 animate-pulse" />
                    Chamados Pendentes
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {calls.length}
                    </span>
                </h2>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {calls.map((call) => (
                    <div
                        key={call.id}
                        className="bg-zinc-800/80 rounded-xl p-4 border border-zinc-700 flex items-center justify-between group hover:border-red-500/50 transition-colors"
                    >
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-white text-lg">Mesa {call.tableNumber}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${call.type === 'bill' ? 'bg-green-500/20 text-green-400' :
                                    call.type === 'assistance' ? 'bg-amber-500/20 text-amber-400' :
                                        'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {getCallTypeLabel(call.type)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                <FiClock className="w-3 h-3" />
                                <span>{formatTime(call.createdAt)}</span>
                                {call.customerName && (
                                    <>
                                        <span>•</span>
                                        <span>{call.customerName}</span>
                                    </>
                                )}
                            </div>
                            {call.notes && (
                                <p className="text-zinc-500 text-sm mt-1 italic">
                                    "{call.notes}"
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => handleAcknowledge(call.id, call.tableNumber)}
                            className="p-3 bg-zinc-700 text-zinc-300 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-lg"
                            title="Marcar como atendido"
                        >
                            <FiCheck className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
