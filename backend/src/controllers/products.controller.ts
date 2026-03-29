import { Request, Response } from "express";
import { validationResult } from "express-validator";

import { CreateProductInput, SearchProductsFilters, productsService } from "../services/products.service";

const parseBoolean = (value: string | undefined): boolean | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  if (value.toLowerCase() === "true") {
    return true;
  }
  if (value.toLowerCase() === "false") {
    return false;
  }
  return undefined;
};

const parseNumber = (value: string | undefined): number | undefined => {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const filters: SearchProductsFilters = {
      q: typeof req.query.q === "string" ? req.query.q : undefined,
      store_id: typeof req.query.store_id === "string" ? req.query.store_id : undefined,
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      min_price: parseNumber(typeof req.query.min_price === "string" ? req.query.min_price : undefined),
      max_price: parseNumber(typeof req.query.max_price === "string" ? req.query.max_price : undefined),
      in_stock: parseBoolean(typeof req.query.in_stock === "string" ? req.query.in_stock : undefined)
    };

    const products = await productsService.searchProducts(filters);
    res.status(200).json({ data: products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Failed to search products", error: message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ message: "Product id is required" });
      return;
    }
    const result = await productsService.getProductById(id);

    if (!result) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.status(200).json({
      data: result.product,
      price_history: result.history
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Failed to fetch product", error: message });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const body = req.body as CreateProductInput;
    const created = await productsService.createProduct({
      store_id: body.store_id,
      name: body.name,
      category: body.category,
      brand: body.brand,
      sku: body.sku,
      url: body.url,
      image_url: body.image_url,
      current_price: Number(body.current_price),
      currency: body.currency
    });

    res.status(201).json({ data: created });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Failed to create product", error: message });
  }
};
