'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { MenuThemeProvider, useMenuSettings } from '@/components/MenuThemeProvider'
import {
    FiHome,
    FiPackage,
    FiList,
    FiPieChart,
    FiSettings,
    FiGrid,
    FiLayers,
    FiMenu,
    FiX,
    FiExternalLink,
    FiLogOut,
    FiUser,
    FiBell
} from 'react-icons/fi'

const navItems = [
    { href: '/admin', icon: FiHome, label: 'Dashboard', exact: true },
    { href: '/admin/orders', icon: FiPackage, label: 'Pedidos' },
    { href: '/admin/calls', icon: FiBell, label: 'Chamados' },
    { href: '/admin/dishes', icon: FiList, label: 'Cardápio' },
    { href: '/admin/categories', icon: FiLayers, label: 'Categorias' },
    { href: '/admin/tables', icon: FiGrid, label: 'Mesas' },
    { href: '/admin/reports', icon: FiPieChart, label: 'Relatórios' },
    { href: '/admin/design', icon: FiSettings, label: 'Design' },
]

function AdminLayoutContent({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout, loading } = useAuth()
    const { settings, loading: settingsLoading } = useMenuSettings() // Usar settings para unificar design
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    const isLoginPage = pathname === '/admin/login'

    const isActive = (item: typeof navItems[0]) => {
        if (item.exact) {
            return pathname === item.href
        }
        return pathname.startsWith(item.href)
    }

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setLoggingOut(false)
        }
    }

    // Colors derived from settings or defaults
    const bgPrimary = settings?.primaryColor || '#f59e0b'
    const bgSecondary = settings?.secondaryColor || '#ea580c'
    const bgColor = settings?.backgroundColor || '#09090b'
    const textColor = settings?.textColor || '#ffffff'

    // If it's the login page, just render children without layout
    if (isLoginPage) {
        return <>{children}</>
    }

    // Show loading state with custom loader
    if (loading || settingsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ backgroundColor: bgColor }}>
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
                        style={{ borderColor: `${bgPrimary}33`, borderTopColor: bgPrimary }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                    </div>
                </div>
                <p className="font-medium animate-pulse" style={{ color: textColor, opacity: 0.7 }}>Carregando...</p>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!user && !loading) {
        router.push('/admin/login')
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ backgroundColor: bgColor }}>
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
                        style={{ borderColor: `${bgPrimary}33`, borderTopColor: bgPrimary }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundColor: bgColor,
                color: textColor,
                ['--admin-hover-color' as any]: bgPrimary // Inject primary color as CSS var for hover effects
            }}
        >
            {/* Mobile Header */}
            <header
                className="lg:hidden sticky top-0 z-50 backdrop-blur-lg px-4 py-3"
                style={{
                    backgroundColor: `${bgColor}F2`, // F2 = 95% opacity
                }}
            >
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: textColor }}
                    >
                        <FiMenu className="w-6 h-6" />
                    </button>
                    <h1
                        className="text-lg font-bold bg-clip-text text-transparent"
                        style={{ backgroundImage: `linear-gradient(to right, ${bgPrimary}, ${bgSecondary})` }}
                    >
                        Admin
                    </h1>
                    <Link
                        href="/"
                        target="_blank"
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: textColor }}
                    >
                        <FiExternalLink className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{
                    backgroundColor: bgColor,
                }}
            >
                {/* Sidebar Header */}
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h1
                            className="text-xl font-bold bg-clip-text text-transparent"
                            style={{ backgroundImage: `linear-gradient(to right, ${bgPrimary}, ${bgSecondary})` }}
                        >
                            Admin Panel
                        </h1>
                        <p className="text-sm mt-1" style={{ color: textColor, opacity: 0.6 }}>Sabores & Aromas</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg transition-colors"
                        style={{ color: textColor, opacity: 0.6 }}
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                {user && (
                    <div className="px-4 py-3">
                        <div className="flex items-center gap-3 px-2">
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ background: `linear-gradient(to right, ${bgPrimary}, ${bgSecondary})` }}
                            >
                                <FiUser className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate" style={{ color: textColor }}>
                                    {user.email}
                                </p>
                                <p className="text-xs" style={{ color: textColor, opacity: 0.6 }}>Administrador</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="p-4 flex-1 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map(item => {
                            const active = isActive(item)
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${active ? 'font-medium' : ''}`}
                                        style={{
                                            background: active
                                                ? `linear-gradient(to right, ${bgPrimary}15, ${bgSecondary}15)`
                                                : 'transparent',
                                            color: active ? bgPrimary : textColor,
                                            borderRight: active ? `3px solid ${bgPrimary}` : '3px solid transparent',
                                            opacity: active ? 1 : 0.7
                                        }}
                                    >
                                        <item.icon
                                            className={`w-5 h-5 transition-colors ${!active ? 'group-hover:text-[var(--admin-hover-color)]' : ''}`}
                                        />
                                        <span className="group-hover:translate-x-1 transition-transform">{item.label}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4" style={{ backgroundColor: bgColor }}>
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2"
                        style={{ color: textColor, opacity: 0.7 }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                    >
                        <FiExternalLink className="w-5 h-5" />
                        Ver Cardápio
                    </Link>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                        {loggingOut ? (
                            <div className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                            <FiLogOut className="w-5 h-5" />
                        )}
                        {loggingOut ? 'Saindo...' : 'Sair'}
                    </button>
                </div>
            </aside >

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div >
    )
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            <MenuThemeProvider>
                <AdminLayoutContent>{children}</AdminLayoutContent>
            </MenuThemeProvider>
        </AuthProvider>
    )
}
