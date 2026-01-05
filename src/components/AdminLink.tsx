'use client'

import Link from 'next/link'
import { FiSettings } from 'react-icons/fi'

export function AdminLink() {
    return (
        <Link
            href="/admin"
            className="fixed top-4 right-4 p-3 bg-zinc-900/80 backdrop-blur-sm rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors z-50 border border-zinc-700 hover:border-zinc-500"
            title="Painel Administrativo"
        >
            <FiSettings className="w-5 h-5" />
        </Link>
    )
}
