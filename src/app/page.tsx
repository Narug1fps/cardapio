import { MenuHeader } from '@/components/MenuHeader'
import { MenuCategory } from '@/components/MenuCategory'
import type { Category, Dish } from '@/types/menu'

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.categories || []
  } catch {
    return []
  }
}

async function getDishes(): Promise<Dish[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dishes`, {
      cache: 'no-store'
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.dishes || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [categories, dishes] = await Promise.all([
    getCategories(),
    getDishes()
  ])

  return (
    <div className="min-h-screen">
      <MenuHeader restaurantName="Sabores & Aromas" />

      <main className="container mx-auto px-4 py-8">
        {categories.length === 0 && dishes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🍽️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Cardápio em breve!
            </h2>
            <p className="text-zinc-400 mb-8">
              Nosso cardápio está sendo preparado. Em breve você poderá ver todos os nossos deliciosos pratos.
            </p>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 shadow-lg shadow-amber-500/25"
            >
              Configurar Cardápio
            </a>
          </div>
        ) : (
          <>
            {categories.map(category => (
              <MenuCategory
                key={category.$id}
                category={category}
                dishes={dishes}
              />
            ))}
          </>
        )}
      </main>

      <footer className="border-t border-zinc-800 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
          <p>© {new Date().getFullYear()} Sabores & Aromas. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
