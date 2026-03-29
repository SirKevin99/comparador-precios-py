import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import ProductCard from '../components/ProductCard'
import { useSearchProducts } from '../hooks/useProducts'
import { useTheme } from '../hooks/useTheme'
import ThemeToggle from '../components/ThemeToggle'

const SKELETONS = Array.from({ length: 3 }, (_, idx) => idx)

function SearchPage() {
  const { isDark } = useTheme()
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput)
    }, 400)

    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  const { data: products = [], isLoading } = useSearchProducts({
    q: debouncedSearch,
    category: selectedCategory || undefined,
    in_stock: inStockOnly || undefined,
  })

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category)
      .filter((category): category is string => Boolean(category))
    return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
  }, [products])

  return (
    <main className="min-h-screen bg-gray-50 transition-colors duration-200 dark:bg-gray-900">
      <ThemeToggle />
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <header className="mb-8 rounded-xl bg-transparent text-center dark:bg-gray-900">
          <h1 className="text-4xl font-extrabold text-blue-900 md:text-5xl dark:text-blue-400">PrecionPY</h1>
          <p className="mt-2 text-base text-slate-600 md:text-lg dark:text-gray-400">Compará precios en Paraguay</p>
        </header>

        <section className="mx-auto mb-4 w-full max-w-3xl">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-gray-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Buscá productos, marcas o categorías..."
              className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </section>

        <section className="mb-8 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-center dark:bg-gray-800">
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(event) => setInStockOnly(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
            />
            Solo en stock
          </label>
        </section>

        {isLoading ? (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SKELETONS.map((skeleton) => (
              <div key={skeleton} className="animate-pulse rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
                <div className="mb-3 h-44 rounded-lg bg-slate-200 dark:bg-gray-700" />
                <div className="mb-2 h-4 w-1/3 rounded bg-slate-200 dark:bg-gray-700" />
                <div className="mb-2 h-4 w-full rounded bg-slate-200 dark:bg-gray-700" />
                <div className="mb-4 h-4 w-2/3 rounded bg-slate-200 dark:bg-gray-700" />
                <div className="h-9 rounded bg-slate-200 dark:bg-gray-700" />
              </div>
            ))}
          </section>
        ) : products.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center text-slate-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
            No se encontraron productos
          </div>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </div>
      <span className="sr-only">{isDark ? 'Tema oscuro activo' : 'Tema claro activo'}</span>
    </main>
  )
}

export default SearchPage
