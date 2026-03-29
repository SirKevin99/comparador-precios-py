export interface Store {
  id: string
  name: string
  url: string
  logo_url: string
  country: string
}

export interface Product {
  id: string
  store_id: string
  name: string
  category: string
  brand: string
  sku: string
  url: string
  image_url: string
  current_price: number
  currency: string
  in_stock: boolean
  last_checked_at: string
  stores: Store
}

export interface PriceHistory {
  id: string
  product_id: string
  price: number
  in_stock: boolean
  source: string
  recorded_at: string
}
