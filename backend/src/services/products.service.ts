import { supabase } from "../config/supabase";

export interface Store {
  id: string;
  name: string;
  url: string;
  logo_url: string | null;
  country: string | null;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  category: string | null;
  brand: string | null;
  sku: string | null;
  url: string;
  image_url: string | null;
  current_price: number;
  currency: string;
  in_stock: boolean;
  last_checked_at: string | null;
  stores?: Store;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  in_stock: boolean;
  source: string;
  recorded_at: string;
}

export interface SearchProductsFilters {
  q?: string;
  store_id?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

export interface CreateProductInput {
  store_id: string;
  name: string;
  category?: string;
  brand?: string;
  sku?: string;
  url: string;
  image_url?: string;
  current_price: number;
  currency?: string;
}

class ProductsService {
  async searchProducts(filters: SearchProductsFilters): Promise<Product[]> {
    let query = supabase
      .from("products")
      .select("*, stores (*)")
      .order("current_price", { ascending: true });

    if (filters.q) {
      query = query.ilike("name", `%${filters.q}%`);
    }
    if (filters.store_id) {
      query = query.eq("store_id", filters.store_id);
    }
    if (filters.category) {
      query = query.eq("category", filters.category);
    }
    if (typeof filters.min_price === "number") {
      query = query.gte("current_price", filters.min_price);
    }
    if (typeof filters.max_price === "number") {
      query = query.lte("current_price", filters.max_price);
    }
    if (typeof filters.in_stock === "boolean") {
      query = query.eq("in_stock", filters.in_stock);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Supabase searchProducts error: ${error.message}`);
    }

    return (data ?? []) as Product[];
  }

  async getProductById(id: string): Promise<{ product: Product; history: PriceHistory[] } | null> {
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("*, stores (*)")
      .eq("id", id)
      .single();

    if (productError) {
      if (productError.code === "PGRST116") {
        return null;
      }
      throw new Error(`Supabase getProductById error: ${productError.message}`);
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: historyData, error: historyError } = await supabase
      .from("price_history")
      .select("*")
      .eq("product_id", id)
      .gte("recorded_at", sixMonthsAgo.toISOString())
      .order("recorded_at", { ascending: true });

    if (historyError) {
      throw new Error(`Supabase getProductById history error: ${historyError.message}`);
    }

    return {
      product: productData as Product,
      history: (historyData ?? []) as PriceHistory[]
    };
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    const newProductPayload = {
      store_id: input.store_id,
      name: input.name,
      category: input.category ?? null,
      brand: input.brand ?? null,
      sku: input.sku ?? null,
      url: input.url,
      image_url: input.image_url ?? null,
      current_price: input.current_price,
      currency: input.currency ?? "USD"
    };

    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert(newProductPayload)
      .select("*, stores (*)")
      .single();

    if (productError) {
      throw new Error(`Supabase createProduct error: ${productError.message}`);
    }

    const { error: historyError } = await supabase.from("price_history").insert({
      product_id: productData.id,
      price: productData.current_price,
      in_stock: productData.in_stock ?? true,
      source: "manual"
    });

    if (historyError) {
      throw new Error(`Supabase createProduct history error: ${historyError.message}`);
    }

    return productData as Product;
  }
}

export const productsService = new ProductsService();
