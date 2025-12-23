'use client'

import Link from 'next/link'
import { FiSettings } from 'react-icons/fi'

interface MenuHeaderProps {
    restaurantName?: string
}

export function MenuHeader({ restaurantName = 'Nosso Restaurante' }: MenuHeaderProps) {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80 border-b border-zinc-800">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                            {restaurantName.charAt(0)}
                        </span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        {restaurantName}
                    </h1>
                </div>

                <Link
                    href="/admin"
                    className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 transition-colors text-zinc-400 hover:text-white"
                    title="Painel Admin"
                >
                    <FiSettings className="w-5 h-5" />
                </Link>
            </div>
        </header>
    )
}
