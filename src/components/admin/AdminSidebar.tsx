'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiHome, FiGrid, FiTag, FiLogOut, FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: FiHome },
    { href: '/admin/dishes', label: 'Pratos', icon: FiGrid },
    { href: '/admin/categories', label: 'Categorias', icon: FiTag }
]

export function AdminSidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800">
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Admin Panel
                </h1>
                <p className="text-zinc-500 text-sm mt-1">Gerencie seu cardápio</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map(item => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/admin' && pathname.startsWith(item.href))

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-800 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all duration-200"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    Ver Cardápio
                </Link>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                >
                    <FiLogOut className="w-5 h-5" />
                    Sair
                </button>
            </div>
        </aside>
    )
}
