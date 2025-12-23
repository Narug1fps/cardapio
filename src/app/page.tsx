import { MenuHeader } from '@/components/MenuHeader'
import { MenuCategory } from '@/components/MenuCategory'
import { getCategories, getDishes } from '@/services/menu'

export const revalidate = 0 // Disable static caching for now

export default async function HomePage() {
  let categories = []
  let dishes = []
  let error = null

  try {
    [categories, dishes] = await Promise.all([
      getCategories(),
      getDishes()
    ])
  } catch (e) {
    console.error('Failed to load menu data:', e)
    error = 'Não foi possível carregar o cardápio. Por favor, tente novamente mais tarde.'
  }

  return (
    <div className="min-h-screen">
      <MenuHeader restaurantName="Sabores & Aromas" />

      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-20 bg-red-900/20 rounded-lg border border-red-500/20">
            <h2 className="text-xl text-red-400 mb-2">Erro</h2>
            <p className="text-zinc-400">{error}</p>
          </div>
        ) : categories.length === 0 && dishes.length === 0 ? (
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
