'use client'

import { useState, useEffect } from 'react'
import {
    FiSave,
    FiRefreshCw,
    FiImage,
    FiType,
    FiDroplet,
    FiEye,
    FiCheck,
    FiLayout
} from 'react-icons/fi'
import type { MenuSettings } from '@/types/orders'
import { ImageUpload } from '@/components/ImageUpload'
import { useToast } from '@/components/Toast'

const fontOptions = [
    { value: 'Inter', label: 'Inter (Moderno)' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Poppins', label: 'Poppins' },
    { value: 'Outfit', label: 'Outfit' },
    { value: 'Playfair Display', label: 'Playfair Display (Elegante)' },
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Lato', label: 'Lato' },
    { value: 'Open Sans', label: 'Open Sans' }
]

const colorPresets = [
    { name: 'Âmbar Clássico', primary: '#f59e0b', secondary: '#ea580c', accent: '#fbbf24', bg: '#09090b', text: '#ffffff', cardBg: '#18181b', cardText: '#ffffff' },
    { name: 'Esmeralda', primary: '#10b981', secondary: '#059669', accent: '#34d399', bg: '#0a0a0a', text: '#ffffff', cardBg: '#18181b', cardText: '#ffffff' },
    { name: 'Oceano', primary: '#0ea5e9', secondary: '#0284c7', accent: '#38bdf8', bg: '#0c0c0c', text: '#ffffff', cardBg: '#18181b', cardText: '#ffffff' },
    { name: 'Rosa Elegante', primary: '#ec4899', secondary: '#db2777', accent: '#f472b6', bg: '#0d0d0d', text: '#ffffff', cardBg: '#18181b', cardText: '#ffffff' },
    { name: 'Roxo Royal', primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa', bg: '#0a0a0a', text: '#ffffff', cardBg: '#18181b', cardText: '#ffffff' },
    { name: 'Vermelho Intenso', primary: '#ef4444', secondary: '#dc2626', accent: '#f87171', bg: '#0c0c0c', text: '#ffffff', cardBg: '#18181b', cardText: '#ffffff' },
    { name: 'Dourado Luxo', primary: '#d4af37', secondary: '#b8860b', accent: '#ffd700', bg: '#1a1a1a', text: '#ffffff', cardBg: '#27272a', cardText: '#ffffff' },
    { name: 'Minimalista Claro', primary: '#18181b', secondary: '#27272a', accent: '#f59e0b', bg: '#fafafa', text: '#18181b', cardBg: '#ffffff', cardText: '#18181b' }
]

// Component moved outside to prevent re-creation on render
const ColorInput = ({ label, value, onChange }: { label: string, value: string, onChange: (color: string) => void }) => (
    <div>
        <label className="block text-sm font-medium text-zinc-400 mb-2">
            {label}
        </label>
        <div className="flex gap-2">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono uppercase"
                maxLength={7}
            />
        </div>
    </div>
)

export default function AdminDesignPage() {
    const [settings, setSettings] = useState<MenuSettings | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [fontLoaded, setFontLoaded] = useState(false)
    const { success, error } = useToast()

    useEffect(() => {
        fetchSettings()
    }, [])

    // Load font dynamically when settings change
    useEffect(() => {
        if (settings?.fontFamily) {
            loadGoogleFont(settings.fontFamily)
        }
    }, [settings?.fontFamily])

    const loadGoogleFont = (fontName: string) => {
        const existingLink = document.querySelector(`link[data-font="${fontName}"]`)
        if (existingLink) {
            setFontLoaded(true)
            return
        }

        const link = document.createElement('link')
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`
        link.rel = 'stylesheet'
        link.setAttribute('data-font', fontName)

        link.onload = () => {
            setFontLoaded(true)
        }

        document.head.appendChild(link)
    }

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings')
            if (response.ok) {
                const data = await response.json()
                setSettings(data)
            }
        } catch (e) {
            console.error('Error fetching settings:', e)
            error('Erro ao carregar configurações')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!settings) return
        setSaving(true)
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })
            if (response.ok) {
                setSaved(true)
                success('Configurações salvas com sucesso!')
                setTimeout(() => setSaved(false), 3000)
            } else {
                throw new Error('Failed to save')
            }
        } catch (e) {
            console.error('Error saving settings:', e)
            error('Erro ao salvar configurações')
        } finally {
            setSaving(false)
        }
    }

    const applyPreset = (preset: typeof colorPresets[0]) => {
        if (!settings) return
        setSettings({
            ...settings,
            primaryColor: preset.primary,
            secondaryColor: preset.secondary,
            accentColor: preset.accent,
            backgroundColor: preset.bg,
            textColor: preset.text,
            cardBackgroundColor: preset.cardBg,
            cardTextColor: preset.cardText
        })
    }

    const updateSetting = (key: keyof MenuSettings, value: any) => {
        if (!settings) return
        setSettings(prev => prev ? ({ ...prev, [key]: value }) : null)
    }

    if (loading) return null // Loading handled by layout

    if (!settings) return null

    const getBorderRadius = (size: string) => {
        switch (size) {
            case 'small': return '0.5rem'
            case 'medium': return '0.75rem'
            case 'large': return '1rem'
            case 'full': return '1.5rem'
            default: return '0.75rem'
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Personalizar Design</h1>
                    <p className="text-zinc-400 mt-1">Customize a aparência do seu cardápio</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all text-white"
                    style={{
                        background: saved
                            ? '#10b981' // emerald-500
                            : `linear-gradient(to right, ${settings.primaryColor || '#f59e0b'}, ${settings.secondaryColor || '#ea580c'})`
                    }}
                >
                    {saving ? <FiRefreshCw className="w-5 h-5 animate-spin" /> : saved ? <FiCheck className="w-5 h-5" /> : <FiSave className="w-5 h-5" />}
                    {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Settings Column */}
                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <FiType
                                className="w-5 h-5"
                                style={{ color: settings.primaryColor || '#f59e0b' }}
                            />
                            Informações Básicas
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Nome do Restaurante
                                </label>
                                <input
                                    type="text"
                                    value={settings.restaurantName}
                                    onChange={(e) => updateSetting('restaurantName', e.target.value)}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none"
                                    style={{ borderColor: settings.primaryColor || '#f59e0b' }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <ImageUpload
                                    label="Logo"
                                    value={settings.logoUrl}
                                    onChange={(url) => updateSetting('logoUrl', url)}
                                />
                                <ImageUpload
                                    label="Banner (Abaixo do Nome)"
                                    value={settings.bannerUrl}
                                    onChange={(url) => updateSetting('bannerUrl', url)}
                                    aspectRatio="banner"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-400 mb-2">
                                    Mensagem de Boas-vindas
                                </label>
                                <textarea
                                    value={settings.welcomeMessage || ''}
                                    onChange={(e) => updateSetting('welcomeMessage', e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Theme Colors - New Section */}
                    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <FiDroplet
                                className="w-5 h-5"
                                style={{ color: settings.primaryColor || '#f59e0b' }}
                            />
                            Cores do Tema
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <ColorInput label="Fundo da Página" value={settings.backgroundColor} onChange={(v) => updateSetting('backgroundColor', v)} />
                            <ColorInput label="Cor do Texto" value={settings.textColor} onChange={(v) => updateSetting('textColor', v)} />
                            <ColorInput label="Primária (Degradê A)" value={settings.primaryColor} onChange={(v) => updateSetting('primaryColor', v)} />
                            <ColorInput label="Secundária (Degradê B)" value={settings.secondaryColor} onChange={(v) => updateSetting('secondaryColor', v)} />
                        </div>
                    </div>

                    {/* Card Customization */}
                    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <FiLayout
                                className="w-5 h-5"
                                style={{ color: settings.primaryColor || '#f59e0b' }}
                            />
                            Estilo dos Cards
                        </h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <ColorInput label="Fundo do Card" value={settings.cardBackgroundColor} onChange={(v) => updateSetting('cardBackgroundColor', v)} />
                                <ColorInput label="Texto do Card" value={settings.cardTextColor} onChange={(v) => updateSetting('cardTextColor', v)} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Arredondamento
                                    </label>
                                    <select
                                        value={settings.cardBorderRadius}
                                        onChange={(e) => updateSetting('cardBorderRadius', e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="small">Pequeno</option>
                                        <option value="medium">Médio</option>
                                        <option value="large">Grande</option>
                                        <option value="full">Redondo</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                                        Tamanho
                                    </label>
                                    <select
                                        value={settings.cardSize}
                                        onChange={(e) => updateSetting('cardSize', e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="compact">Compacto</option>
                                        <option value="normal">Normal</option>
                                        <option value="large">Expandido</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Font Settings */}
                    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <FiType
                                className="w-5 h-5"
                                style={{ color: settings.primaryColor || '#f59e0b' }}
                            />
                            Tipografia
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">
                                Fonte Principal
                            </label>
                            <select
                                value={settings.fontFamily}
                                onChange={(e) => updateSetting('fontFamily', e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                            >
                                {fontOptions.map(font => (
                                    <option key={font.value} value={font.value}>{font.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Color Presets */}
                    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <FiDroplet
                                className="w-5 h-5"
                                style={{ color: settings.primaryColor || '#f59e0b' }}
                            />
                            Temas Prontos
                        </h2>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {colorPresets.map(preset => (
                                <button
                                    key={preset.name}
                                    onClick={() => applyPreset(preset)}
                                    className="group p-3 rounded-xl border border-zinc-700 hover:border-zinc-600 transition-all"
                                >
                                    <div className="flex gap-1 mb-2">
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondary }} />
                                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                                    </div>
                                    <p className="text-xs text-zinc-500 group-hover:text-zinc-300 transition-colors truncate">
                                        {preset.name}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Preview Column */}
                <div className="lg:sticky lg:top-8 h-fit">
                    <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6">
                        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                            <FiEye
                                className="w-5 h-5"
                                style={{ color: settings.primaryColor || '#f59e0b' }}
                            />
                            Preview do Cardápio
                        </h2>

                        {/* Mock Preview */}
                        <div
                            className="rounded-xl overflow-hidden border border-zinc-700 relative isolate"
                            style={{
                                backgroundColor: settings.backgroundColor,
                                fontFamily: settings.fontFamily
                            }}
                        >
                            {/* Header Preview */}
                            <div className="p-6 text-center border-b border-zinc-700/50 relative z-10 w-full overflow-hidden">
                                <div className="text-4xl mb-4 flex justify-center">
                                    {settings.logoUrl ? (
                                        <img src={settings.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
                                    ) : (
                                        <span>🍽️</span>
                                    )}
                                </div>
                                <h3
                                    className="text-2xl font-bold break-words bg-clip-text text-transparent"
                                    style={{
                                        backgroundImage: `linear-gradient(to right, ${settings.primaryColor}, ${settings.secondaryColor})`
                                    }}
                                >
                                    {settings.restaurantName}
                                </h3>

                                {settings.bannerUrl && (
                                    <div className="mt-4 mb-2 rounded-xl overflow-hidden h-32 w-full">
                                        <img
                                            src={settings.bannerUrl}
                                            alt="Banner"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {settings.welcomeMessage && (
                                    <p className="mt-2 opacity-60" style={{ color: settings.textColor }}>
                                        {settings.welcomeMessage}
                                    </p>
                                )}
                            </div>

                            {/* Menu Item Preview */}
                            <div className="p-4 relative z-10">
                                <div
                                    className="overflow-hidden mb-4 shadow-lg transition-transform hover:scale-[1.02]"
                                    style={{
                                        backgroundColor: settings.cardBackgroundColor,
                                        borderRadius: getBorderRadius(settings.cardBorderRadius),
                                        padding: settings.cardSize === 'compact' ? '0.75rem' : settings.cardSize === 'large' ? '1.5rem' : '1rem'
                                    }}
                                >
                                    {settings.showImages && (
                                        <div className="h-32 bg-gradient-to-br from-zinc-800 to-zinc-700 flex items-center justify-center rounded-lg mb-3">
                                            <FiImage className="w-8 h-8 text-zinc-600" />
                                        </div>
                                    )}
                                    <div>
                                        <h4
                                            className="font-semibold"
                                            style={{ color: settings.cardTextColor }}
                                        >
                                            Prato Exemplo
                                        </h4>
                                        <p
                                            className="text-sm mt-1 opacity-70"
                                            style={{ color: settings.cardTextColor }}
                                        >
                                            Descrição deliciosa do prato...
                                        </p>
                                        {settings.showPrices && (
                                            <p
                                                className="text-lg font-bold mt-2"
                                                style={{ color: settings.primaryColor }}
                                            >
                                                R$ 49,90
                                            </p>
                                        )}
                                        <button
                                            className="mt-3 w-full py-2 rounded-lg text-white font-medium shadow-md shadow-amber-500/20"
                                            style={{
                                                background: `linear-gradient(to right, ${settings.primaryColor}, ${settings.secondaryColor})`
                                            }}
                                        >
                                            Adicionar
                                        </button>
                                    </div>
                                </div>

                                {/* Footer Preview */}
                                <div className="text-center py-4 border-t border-zinc-700/50 mt-4">
                                    <p className="text-sm opacity-50" style={{ color: settings.textColor }}>
                                        {settings.footerText || `© ${new Date().getFullYear()} ${settings.restaurantName}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
