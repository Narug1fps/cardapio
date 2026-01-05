'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TableSelector } from '@/components/TableSelector'
import { MenuThemeProvider, useMenuSettings } from '@/components/MenuThemeProvider'
import { AdminLink } from '@/components/AdminLink'
import { useCart } from '@/contexts/CartContext'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { settings, loading: settingsLoading } = useMenuSettings()
  const { setTableNumber } = useCart()
  const [checkingTable, setCheckingTable] = useState(true)

  useEffect(() => {
    // Check if there's a table parameter from QR Code
    const tableParam = searchParams.get('table')

    if (tableParam) {
      const parsedTable = parseInt(tableParam, 10)
      if (!isNaN(parsedTable) && parsedTable > 0) {
        // Auto-select table from QR Code using Context to ensure sync
        console.log(`[HomePage] Definindo mesa ${parsedTable} via QR Code`)
        setTableNumber(parsedTable)

        router.push('/menu')
        return
      }
    }

    setCheckingTable(false)
  }, [searchParams, router, setTableNumber])

  if (settingsLoading || checkingTable) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <MenuThemeProvider initialSettings={settings}>
      <div
        className="min-h-screen"
        style={{
          backgroundColor: settings?.backgroundColor || '#09090b',
          color: settings?.textColor || '#ffffff'
        }}
      >
        <AdminLink />
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-5"
            style={{ backgroundColor: settings?.primaryColor || '#f59e0b' }}
          ></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-5"
            style={{ backgroundColor: settings?.secondaryColor || '#ea580c' }}
          ></div>
        </div>

        {/* Logo Header */}
        <header className="relative py-8 text-center">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.restaurantName}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-white/10 shadow-xl"
            />
          ) : (
            <div className="text-5xl mb-4">🍽️</div>
          )}

          <h1
            className="text-3xl md:text-4xl font-bold px-4 bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(to right, ${settings?.primaryColor || '#fbbf24'}, ${settings?.secondaryColor || '#f97316'})`
            }}
          >
            {settings?.restaurantName || 'Sabores & Aromas'}
          </h1>
          {settings?.welcomeMessage && (
            <p className="mt-2 max-w-md mx-auto opacity-60 px-4">
              {settings.welcomeMessage}
            </p>
          )}
        </header>

        {/* Table Selector */}
        <TableSelector
          redirectTo="/menu"
          primaryColor={settings?.primaryColor}
          secondaryColor={settings?.secondaryColor}
        />
      </div>
    </MenuThemeProvider>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
        <p className="text-zinc-400">Carregando...</p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  )
}
