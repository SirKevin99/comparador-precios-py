import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { api } from '../lib/api'
import type { Product } from '../types'

export interface Alert {
  id: string
  user_id: string
  product_id: string
  target_price: number | null
  condition: 'below' | 'above' | 'any'
  is_active: boolean
  last_notified_at: string | null
  products: Product
}

interface AlertsResponse {
  data: Alert[]
}

const fetchAlerts = async (userId: string): Promise<Alert[]> => {
  const response = await api.get<AlertsResponse>(`/alerts/${userId}`)
  return response.data.data ?? []
}

export const useAlerts = (userId?: string) => {
  return useQuery({
    queryKey: ['alerts', userId],
    queryFn: () => fetchAlerts(userId as string),
    enabled: Boolean(userId),
  })
}

export const useCancelAlert = (userId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (alertId: string) => {
      await api.patch(`/alerts/${alertId}`, { is_active: false })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['alerts', userId] })
    },
  })
}
