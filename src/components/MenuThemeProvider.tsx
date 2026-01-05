'use client'

import { useEffect, useState, ReactNode } from 'react'
import type { MenuSettings } from '@/types/orders'

interface MenuThemeProviderProps {
    children: ReactNode
    initialSettings?: MenuSettings | null
}

// Named export do componente (para compatibilidade com quem usa { MenuThemeProvider })
export function MenuThemeProvider({ children, initialSettings }: MenuThemeProviderProps) {
    const [settings, setSettings] = useState<MenuSettings | null>(initialSettings || null)

    useEffect(() => {
        // Se não vieram configurações iniciais, busca no cliente
        if (!settings) {
            fetchSettings()
        }
    }, []) // Executa apenas na montagem

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings')
            if (response.ok) {
                const data = await response.json()
                setSettings(data)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        }
    }

    useEffect(() => {
        if (settings?.fontFamily) {
            loadGoogleFont(settings.fontFamily)
        }
    }, [settings?.fontFamily])

    const loadGoogleFont = (fontName: string) => {
        const existingLink = document.querySelector(`link[data-font="${fontName}"]`)
        if (existingLink) return

        const link = document.createElement('link')
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`
        link.rel = 'stylesheet'
        link.setAttribute('data-font', fontName)
        document.head.appendChild(link)
    }

    const getBorderRadius = (size: string) => {
        switch (size) {
            case 'small': return '0.5rem'
            case 'medium': return '0.75rem'
            case 'large': return '1rem'
            case 'full': return '1.5rem'
            default: return '0.75rem'
        }
    }

    const getPadding = (size: string) => {
        switch (size) {
            case 'compact': return '0.75rem'
            case 'large': return '1.5rem'
            default: return '1rem'
        }
    }

    const themeStyles = settings ? {
        '--menu-primary': settings.primaryColor,
        '--menu-secondary': settings.secondaryColor,
        '--menu-accent': settings.accentColor,
        '--menu-bg': settings.backgroundColor,
        '--menu-text': settings.textColor,
        '--menu-font': settings.fontFamily,
        '--card-bg': settings.cardBackgroundColor || '#18181b',
        '--card-text': settings.cardTextColor || '#ffffff',
        '--card-radius': getBorderRadius(settings.cardBorderRadius),
        '--card-padding': getPadding(settings.cardSize),
        fontFamily: `${settings.fontFamily}, sans-serif`,
    } as React.CSSProperties : {}

    return (
        <div style={themeStyles}>
            {children}
        </div>
    )
}

// Hook para usar as configurações (Recriado)
export function useMenuSettings() {
    const [settings, setSettings] = useState<MenuSettings | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings')
            if (response.ok) {
                const data = await response.json()
                setSettings(data)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    return { settings, loading }
}

// Default export também apontando para o componente (para o layout.tsx)
export default MenuThemeProvider
