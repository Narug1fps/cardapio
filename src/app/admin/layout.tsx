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

    // Show loading state
    if (loading || settingsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: bgPrimary }}></div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!user && !loading) {
        router.push('/admin/login')
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
            {/* Mobile Header */}
            <header className="lg:hidden sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-lg border-b border-zinc-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"
                    >
                        <FiMenu className="w-6 h-6" />
                    </button>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Admin
                    </h1>
                    <Link
                        href="/"
                        target="_blank"
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"
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
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-zinc-900 border-r border-zinc-800 transform transition-transform duration-300 ease-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Sidebar Header */}
                <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                            Admin Panel
                        </h1>
                        <p className="text-zinc-500 text-sm mt-1">Sabores & Aromas</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-zinc-800 text-zinc-400"
                    >
                        <FiX className="w-5 h-5" />
                    </button>
                </div>

                {/* User Info */}
                {user && (
                    <div className="px-4 py-3 border-b border-zinc-800">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
                                <FiUser className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                    {user.email}
                                </p>
                                <p className="text-zinc-500 text-xs">Administrador</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="p-4 flex-1 overflow-y-auto">
                    <ul className="space-y-1">
                        {navItems.map(item => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item)
                                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/20'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-800 bg-zinc-900">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors mb-2"
                    >
                        <FiExternalLink className="w-5 h-5" />
                        Ver Cardápio
                    </Link>
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                        {loggingOut ? (
                            <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                            <FiLogOut className="w-5 h-5" />
                        )}
                        {loggingOut ? 'Saindo...' : 'Sair'}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
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
