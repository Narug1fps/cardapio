'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import type { MenuSettings } from '@/types/orders'

interface MenuThemeContextType {
    settings: MenuSettings | null
    loading: boolean
    refreshSettings: () => Promise<void>
    updateLocalSettings: (newSettings: Partial<MenuSettings>) => void
}

const MenuThemeContext = createContext<MenuThemeContextType | undefined>(undefined)

interface MenuThemeProviderProps {
    children: ReactNode
    initialSettings?: MenuSettings | null
}

const SETTINGS_STORAGE_KEY = 'menu-settings-cache'

export function MenuThemeProvider({ children, initialSettings }: MenuThemeProviderProps) {
    // Initialize with initialSettings (server-side) or null.
    // We cannot read localStorage during initialization because it causes Hydration Mismatch.
    const [settings, setSettings] = useState<MenuSettings | null>(initialSettings || null)

    // Mount state to prevent hydration mismatch
    const [mounted, setMounted] = useState(false)

    // Initial load from localStorage
    useEffect(() => {
        setMounted(true)
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem(SETTINGS_STORAGE_KEY)
            if (cached) {
                try {
                    setSettings(JSON.parse(cached))
                } catch (e) {
                    console.error('Error parsing settings cache', e)
                }
            }
        }
    }, [])

    const [loading, setLoading] = useState(!settings)

    const fetchSettings = useCallback(async () => {
        try {
            const response = await fetch('/api/settings')
            if (response.ok) {
                const data = await response.json()
                setSettings(data)
                // Salva no cache
                if (typeof window !== 'undefined') {
                    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data))
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    useEffect(() => {
        if (settings?.fontFamily) {
            loadGoogleFont(settings.fontFamily)
        }
    }, [settings?.fontFamily])

    const updateLocalSettings = useCallback((newSettings: Partial<MenuSettings>) => {
        setSettings(prev => {
            const updated = prev ? { ...prev, ...newSettings } : newSettings as MenuSettings
            if (typeof window !== 'undefined') {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated))
            }
            return updated
        })
    }, [])

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

    const getImageHeight = (size: string) => {
        switch (size) {
            case 'compact': return '80px'
            case 'large': return '128px'
            default: return '112px'
        }
    }

    const themeStyles = settings ? {
        '--menu-primary': settings.primaryColor,
        '--menu-secondary': settings.secondaryColor,
        '--menu-accent': settings.accentColor,
        '--menu-bg': settings.backgroundColor,
        '--menu-text': settings.textColor,
        '--menu-text-secondary': `color-mix(in srgb, ${settings.textColor} 60%, transparent)`,
        '--menu-font': settings.fontFamily,
        '--card-bg': settings.cardBackgroundColor || '#ffffff',
        '--card-text': settings.cardTextColor || '#18181b',
        '--card-text-secondary': `color-mix(in srgb, ${settings.cardTextColor || '#18181b'} 60%, transparent)`,
        '--card-border': `color-mix(in srgb, ${settings.primaryColor} 25%, transparent)`,
        '--card-radius': getBorderRadius(settings.cardBorderRadius),
        '--card-padding': getPadding(settings.cardSize),
        '--card-image-height': getImageHeight(settings.cardSize),
        fontFamily: `${settings.fontFamily}, sans-serif`,
        color: settings.textColor,
    } as React.CSSProperties : {}

    return (
        <MenuThemeContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateLocalSettings }}>
            <div style={themeStyles}>
                <style jsx global>{`
                    body {
                        background-color: ${settings?.backgroundColor || '#09090b'} !important;
                        color: ${settings?.textColor || '#ffffff'};
                    }
                    ::selection {
                        background-color: ${settings?.primaryColor || '#f59e0b'};
                        color: #ffffff;
                    }
                `}</style>
                {children}
            </div>
        </MenuThemeContext.Provider>
    )
}

// Hook agora usa o Contexto
export function useMenuSettings() {
    const context = useContext(MenuThemeContext)
    if (context === undefined) {
        throw new Error('useMenuSettings must be used within a MenuThemeProvider')
    }
    return context
}

export default MenuThemeProvider
