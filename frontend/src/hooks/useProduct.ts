import { useQuery } from '@tanstack/react-query'

import { api } from '../lib/api'
import type { PriceHistory, Product } from '../types'

export interface ProductDetail extends Product {
  price_history: PriceHistory[]
}

interface ProductResponseNested {
  data: ProductDetail
}

interface ProductResponseLegacy {
  data: Product
  price_history: PriceHistory[]
}

const fetchProduct = async (id: string): Promise<ProductDetail> => {
  const response = await api.get<ProductResponseNested | ProductResponseLegacy>(`/products/${id}`)
  const payload = response.data

  if ('price_history' in payload.data) {
    return payload.data as ProductDetail
  }

  return {
    ...(payload.data as Product),
    price_history: 'price_history' in payload ? payload.price_history : [],
  }
}

export const useProduct = (id?: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id as string),
    enabled: Boolean(id),
  })
}
