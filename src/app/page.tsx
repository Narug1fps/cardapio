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
      <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ backgroundColor: settings?.backgroundColor || '#09090b' }}>
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
            style={{
              borderColor: `${settings?.primaryColor || '#f59e0b'}33`,
              borderTopColor: settings?.primaryColor || '#f59e0b'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🍽️</span>
          </div>
        </div>
        <p className="font-medium animate-pulse" style={{ color: settings?.textColor || '#ffffff', opacity: 0.7 }}>Carregando...</p>
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
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center flex-col gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin border-amber-900/20 border-t-amber-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🍽️</span>
        </div>
      </div>
      <p className="text-zinc-400 font-medium animate-pulse">Carregando...</p>
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
