import { ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { Product } from '../types'

interface ProductCardProps {
  product: Product
}

const STORE_BADGE_COLORS = [
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-emerald-100 text-emerald-800',
  'bg-orange-100 text-orange-800',
  'bg-pink-100 text-pink-800',
]

const getStoreBadgeColor = (storeName: string): string => {
  const hash = Array.from(storeName).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return STORE_BADGE_COLORS[hash % STORE_BADGE_COLORS.length]
}

const formatPrice = (price: number): string => {
  return `Gs. ${price.toLocaleString('es-PY')}`
}

function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate()
  const [hasImageError, setHasImageError] = useState(false)

  return (
    <article className="rounded-xl bg-white p-4 shadow-sm transition duration-300 hover:scale-[1.01] hover:shadow-lg dark:bg-gray-800 dark:shadow-gray-900">
      <div className="relative mb-3 h-44 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
        {hasImageError || !product.image_url ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            <ImageIcon className="h-10 w-10" />
          </div>
        ) : (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={() => setHasImageError(true)}
          />
        )}
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStoreBadgeColor(product.stores?.name ?? 'tienda')}`}
        >
          {product.stores?.name ?? 'Tienda'}
        </span>
        {!product.in_stock ? (
          <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
            Sin stock
          </span>
        ) : null}
      </div>

      <h3 className="mb-2 line-clamp-2 min-h-[3rem] text-left text-sm font-semibold text-gray-900 dark:text-white">{product.name}</h3>
      <p className="mb-1 text-left text-2xl font-bold text-gray-900 dark:text-white">{formatPrice(product.current_price)}</p>
      <p className="mb-4 text-left text-xs text-gray-500 dark:text-gray-400">{product.category || 'Sin categoría'}</p>

      <button
        type="button"
        onClick={() => navigate(`/product/${product.id}`)}
        className="w-full rounded-lg bg-blue-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-800 dark:hover:bg-blue-500"
      >
        Ver detalles
      </button>
    </article>
  )
}

export default ProductCard
