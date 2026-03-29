import { useQuery } from '@tanstack/react-query'

import { api } from '../lib/api'
import type { Product } from '../types'

export interface SearchProductsParams {
  q?: string
  category?: string
  in_stock?: boolean
}

interface SearchProductsResponse {
  data: Product[]
}

const fetchProducts = async (params: SearchProductsParams): Promise<Product[]> => {
  const response = await api.get<SearchProductsResponse>('/products/search', {
    params: {
      q: params.q ?? '',
      category: params.category || undefined,
      in_stock: params.in_stock ? true : undefined,
    },
  })
  return response.data.data ?? []
}

export const useSearchProducts = (params: SearchProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
  })
}
