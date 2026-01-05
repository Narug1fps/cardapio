'use client'

import { useState, useEffect } from 'react'
import {
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiUsers,
    FiCheck,
    FiX,
    FiRefreshCw,
    FiDownload,
    FiCopy,
    FiAlertTriangle
} from 'react-icons/fi'
import { FaQrcode } from 'react-icons/fa'
import { useToast } from '@/components/Toast'
import { Table } from '@/types/orders'

export default function AdminTablesPage() {
    const [tables, setTables] = useState<Table[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editingTable, setEditingTable] = useState<Table | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [newTable, setNewTable] = useState({ number: 0, name: '', seats: 4 })
    const [qrModalTable, setQrModalTable] = useState<Table | null>(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null)
    const { success, error } = useToast()

    useEffect(() => {
        fetchTables()
    }, [])

    const fetchTables = async () => {
        try {
            const response = await fetch('/api/tables')
            if (response.ok) {
                const data = await response.json()
                setTables(data)
            }
        } catch (err) {
            console.error('Error fetching tables:', err)
            error('Não foi possível carregar as mesas')
        } finally {
            setLoading(false)
        }
    }

    const generateQRCodeUrl = (tableNumber: number) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const tableUrl = `${baseUrl}/?table=${tableNumber}`
        return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(tableUrl)}`
    }

    const getTableUrl = (tableNumber: number) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        return `${baseUrl}/?table=${tableNumber}`
    }

    const getNextTableNumber = () => {
        if (tables.length === 0) return 1
        return Math.max(...tables.map(t => t.number)) + 1
    }

    const handleCreateTable = async () => {
        setSaving(true)
        try {
            const tableNumber = newTable.number || getNextTableNumber()
            const response = await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    number: tableNumber,
                    name: newTable.name || null,
                    seats: newTable.seats,
                    qrCode: getTableUrl(tableNumber),
                    isActive: true,
                    status: 'available'
                })
            })

            if (response.ok) {
                await fetchTables()
                setIsCreating(false)
                setNewTable({ number: 0, name: '', seats: 4 })
                success('Mesa criada com sucesso!')
            } else {
                error('Erro ao criar mesa')
            }
        } catch (err) {
            console.error('Error creating table:', err)
            error('Erro ao criar mesa')
        } finally {
            setSaving(false)
        }
    }

    const handleUpdateTable = async () => {
        if (!editingTable) return
        setSaving(true)
        try {
            const response = await fetch('/api/tables', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingTable.id,
                    number: editingTable.number,
                    name: editingTable.name || null,
                    seats: editingTable.seats,
                    isActive: editingTable.isActive,
                    qrCode: getTableUrl(editingTable.number),
                    status: editingTable.status
                })
            })

            if (response.ok) {
                await fetchTables()
                setEditingTable(null)
                success('Mesa atualizada com sucesso!')
            } else {
                error('Erro ao atualizar mesa')
            }
        } catch (err) {
            console.error('Error updating table:', err)
            error('Erro ao atualizar mesa')
        } finally {
            setSaving(false)
        }
    }

    const executeDelete = async () => {
        if (!deleteConfirmation) return

        try {
            const response = await fetch(`/api/tables?id=${deleteConfirmation}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                setTables(prev => prev.filter(t => t.id !== deleteConfirmation))
                success('Mesa excluída com sucesso')
            } else {
                error('Erro ao excluir mesa')
            }
        } catch (err) {
            console.error('Error deleting table:', err)
            error('Erro ao excluir mesa')
        } finally {
            setDeleteConfirmation(null)
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        success('Link copiado para a área de transferência!')
    }

    const downloadQRCode = (tableNumber: number) => {
        const link = document.createElement('a')
        link.href = generateQRCodeUrl(tableNumber)
        link.download = `mesa-${tableNumber}-qrcode.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        success('Download iniciado')
    }

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'occupied': return 'Ocupada'
            case 'reserved': return 'Reservada'
            default: return 'Livre'
        }
    }

    const getStatusColor = (status?: string) => {
        switch (status) {
            case 'occupied': return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'reserved': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            default: return 'bg-green-500/20 text-green-400 border-green-500/30'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8 w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Gerenciar Mesas</h1>
                    <p className="text-zinc-400 mt-1">Configure as mesas do seu restaurante</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchTables}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                        Atualizar
                    </button>
                    <button
                        onClick={() => {
                            setNewTable({ number: getNextTableNumber(), name: '', seats: 4 })
                            setIsCreating(true)
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all"
                    >
                        <FiPlus className="w-4 h-4" />
                        Nova Mesa
                    </button>
                </div>
            </div>

            {/* Create Table Form */}
            {isCreating && (
                <div className="bg-zinc-900/50 rounded-2xl border border-amber-500/30 p-6 animate-fade-in">
                    <h2 className="text-lg font-semibold text-white mb-4">Nova Mesa</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Número da Mesa
                            </label>
                            <input
                                type="number"
                                value={newTable.number}
                                onChange={(e) => setNewTable(prev => ({ ...prev, number: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Nome/Identificação (Opcional)
                            </label>
                            <input
                                type="text"
                                value={newTable.name}
                                onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Ex: Mesa VIP, Varanda..."
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Número de Lugares
                            </label>
                            <input
                                type="number"
                                value={newTable.seats}
                                onChange={(e) => setNewTable(prev => ({ ...prev, seats: parseInt(e.target.value) || 4 }))}
                                min={1}
                                max={20}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleCreateTable}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
                            Salvar
                        </button>
                        <button
                            onClick={() => setIsCreating(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                        >
                            <FiX className="w-4 h-4" />
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Edit Table Form */}
            {editingTable && (
                <div className="bg-zinc-900/50 rounded-2xl border border-blue-500/30 p-6 animate-fade-in">
                    <h2 className="text-lg font-semibold text-white mb-4">Editar Mesa {editingTable.number}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Número da Mesa
                            </label>
                            <input
                                type="number"
                                value={editingTable.number}
                                onChange={(e) => setEditingTable({ ...editingTable, number: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Nome/Identificação
                            </label>
                            <input
                                type="text"
                                value={editingTable.name || ''}
                                onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
                                placeholder="Ex: Mesa VIP..."
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Lugares
                            </label>
                            <input
                                type="number"
                                value={editingTable.seats}
                                onChange={(e) => setEditingTable({ ...editingTable, seats: parseInt(e.target.value) || 4 })}
                                min={1}
                                max={20}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Status da Reserva
                            </label>
                            <select
                                value={editingTable.status || 'available'}
                                onChange={(e) => setEditingTable({ ...editingTable, status: e.target.value as any })}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="available">Livre</option>
                                <option value="occupied">Ocupada</option>
                                <option value="reserved">Reservada</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleUpdateTable}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiCheck className="w-4 h-4" />}
                            Salvar Alterações
                        </button>
                        <button
                            onClick={() => setEditingTable(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                        >
                            <FiX className="w-4 h-4" />
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tables.map(table => (
                    <div
                        key={table.id}
                        className={`bg-zinc-900/50 rounded-2xl border p-6 transition-all relative overflow-hidden ${table.isActive
                            ? 'border-zinc-800 hover:border-zinc-700'
                            : 'border-zinc-800 opacity-50 bg-zinc-950'
                            }`}
                    >
                        {!table.isActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 pointer-events-none">
                                <span className="bg-zinc-800 text-zinc-400 px-3 py-1 rounded-full text-sm font-bold border border-zinc-700">INATIVA</span>
                            </div>
                        )}

                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="text-3xl font-bold text-white">{table.number}</div>
                                {table.name && (
                                    <p className="text-zinc-500 text-sm mt-1">{table.name}</p>
                                )}
                            </div>

                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(table.status)}`}>
                                {getStatusLabel(table.status)}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-500 text-sm mb-6">
                            <FiUsers className="w-4 h-4" />
                            <span>{table.seats} lugares</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setQrModalTable(table)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
                            >
                                <FaQrcode className="w-4 h-4" />
                                QR Code
                            </button>
                            <button
                                onClick={() => setEditingTable(table)}
                                className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors"
                            >
                                <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setDeleteConfirmation(table.id)}
                                className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors"
                                title="Excluir Mesa"
                            >
                                <FiTrash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {tables.length === 0 && !isCreating && (
                <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-12 text-center">
                    <FiUsers className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500 mb-4">Nenhuma mesa cadastrada</p>
                    <button
                        onClick={() => {
                            setNewTable({ number: 1, name: '', seats: 4 })
                            setIsCreating(true)
                        }}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                    >
                        Adicionar Primeira Mesa
                    </button>
                </div>
            )}

            {/* QR Code Modal */}
            {qrModalTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setQrModalTable(null)}
                    />
                    <div className="relative bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-md w-full animate-fade-in">
                        <button
                            onClick={() => setQrModalTable(null)}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"
                        >
                            <FiX className="w-5 h-5" />
                        </button>
                        {/* ... QR Code Content ... */}
                        <h2 className="text-xl font-bold text-white mb-2">QR Code - Mesa {qrModalTable.number}</h2>
                        <div className="bg-white rounded-xl p-4 mb-4">
                            <img
                                src={generateQRCodeUrl(qrModalTable.number)}
                                alt={`QR Code Mesa ${qrModalTable.number}`}
                                className="w-full aspect-square"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => downloadQRCode(qrModalTable.number)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all"
                            >
                                <FiDownload className="w-5 h-5" />
                                Baixar QR Code
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deleteConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDeleteConfirmation(null)}
                    />
                    <div className="relative bg-zinc-900 rounded-2xl border border-red-500/30 p-6 max-w-sm w-full animate-fade-in shadow-2xl shadow-red-500/10">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                <FiAlertTriangle className="w-6 h-6 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Excluir Mesa?</h3>
                            <p className="text-zinc-400 mb-6">
                                Tem certeza que deseja excluir esta mesa? Esta ação não pode ser desfeita e removerá o histórico associado.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteConfirmation(null)}
                                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={executeDelete}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
