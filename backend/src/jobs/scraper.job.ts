import axios from "axios";
import * as cheerio from "cheerio";
import cron from "node-cron";

import { supabase } from "../config/supabase";
import { AlertCondition } from "../services/alerts.service";
import { sendPriceAlert } from "../services/notifications.service";

interface StoreWithScraperConfig {
  name: string;
  scraper_config?: {
    price_selector?: string;
  } | null;
}

interface ProductToScrape {
  id: string;
  name: string;
  url: string;
  currency: string;
  current_price: number;
  is_active: boolean;
  stores: StoreWithScraperConfig[] | null;
}

interface AlertRow {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number | null;
  condition: AlertCondition;
  is_active: boolean;
}

interface UserRow {
  id: string;
  email: string;
}

const CRON_EXPRESSION = "0 */6 * * *";
let isRunning = false;

const parsePriceToInt = (rawPrice: string): number | null => {
  if (!rawPrice) {
    return null;
  }
  const digitsOnly = rawPrice.replace(/[^\d]/g, "");
  if (!digitsOnly) {
    return null;
  }
  const parsed = Number.parseInt(digitsOnly, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const shouldNotify = (condition: AlertCondition, targetPrice: number | null, newPrice: number): boolean => {
  if (condition === "any") {
    return true;
  }
  if (targetPrice === null) {
    return false;
  }
  if (condition === "below") {
    return newPrice < targetPrice;
  }
  return newPrice > targetPrice;
};

const runScraperCycle = async (): Promise<void> => {
  if (isRunning) {
    console.log("Scraper ya en ejecución, se omite ciclo solapado");
    return;
  }
  isRunning = true;

  let updatedCount = 0;
  let errorCount = 0;

  try {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, url, currency, current_price, is_active, stores(name, scraper_config)")
      .eq("is_active", true);

    if (productsError) {
      throw new Error(`Error fetching active products: ${productsError.message}`);
    }

    const productList = (products ?? []) as ProductToScrape[];

    for (const product of productList) {
      try {
        const store = product.stores?.[0] ?? null;
        const selector = store?.scraper_config?.price_selector;
        if (!selector) {
          errorCount += 1;
          console.error(`Sin price_selector para producto ${product.id}`);
          continue;
        }

        const response = await axios.get<string>(product.url, {
          timeout: 15000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36"
          }
        });

        const $ = cheerio.load(response.data);
        const rawPrice = $(selector).first().text().trim();
        const extractedPrice = parsePriceToInt(rawPrice);

        if (extractedPrice === null || extractedPrice <= 0) {
          errorCount += 1;
          console.error(`Precio inválido para producto ${product.id}`);
          continue;
        }

        if (extractedPrice === product.current_price) {
          continue;
        }

        const oldPrice = product.current_price;
        const newPrice = extractedPrice;
        const nowIso = new Date().toISOString();

        const { error: updateProductError } = await supabase
          .from("products")
          .update({
            current_price: newPrice,
            last_checked_at: nowIso
          })
          .eq("id", product.id);

        if (updateProductError) {
          throw new Error(`Error updating product ${product.id}: ${updateProductError.message}`);
        }

        const { error: historyError } = await supabase.from("price_history").insert({
          product_id: product.id,
          price: newPrice,
          source: "scraper"
        });

        if (historyError) {
          throw new Error(`Error inserting history for product ${product.id}: ${historyError.message}`);
        }

        const { data: alertsData, error: alertsError } = await supabase
          .from("alerts")
          .select("id, user_id, product_id, target_price, condition, is_active")
          .eq("product_id", product.id)
          .eq("is_active", true);

        if (alertsError) {
          throw new Error(`Error fetching alerts for product ${product.id}: ${alertsError.message}`);
        }

        const alerts = (alertsData ?? []) as AlertRow[];

        if (alerts.length > 0) {
          const userIds = [...new Set(alerts.map((alert) => alert.user_id))];
          const { data: usersData, error: usersError } = await supabase
            .from("users")
            .select("id, email")
            .in("id", userIds);

          if (usersError) {
            throw new Error(`Error fetching users for product ${product.id}: ${usersError.message}`);
          }

          const usersMap = new Map<string, string>();
          ((usersData ?? []) as UserRow[]).forEach((user) => {
            usersMap.set(user.id, user.email);
          });

          for (const alert of alerts) {
            if (!shouldNotify(alert.condition, alert.target_price, newPrice)) {
              continue;
            }

            const userEmail = usersMap.get(alert.user_id);
            if (!userEmail) {
              errorCount += 1;
              console.error(`No se encontró email para user_id=${alert.user_id}`);
              continue;
            }

            await sendPriceAlert(userEmail, {
              productName: product.name,
              storeName: store?.name ?? "Tienda",
              oldPrice,
              newPrice,
              productUrl: product.url,
              currency: product.currency || "PYG"
            });

            const { error: alertUpdateError } = await supabase
              .from("alerts")
              .update({ last_notified_at: nowIso })
              .eq("id", alert.id);

            if (alertUpdateError) {
              throw new Error(`Error updating alert ${alert.id}: ${alertUpdateError.message}`);
            }
          }
        }

        updatedCount += 1;
      } catch (error) {
        errorCount += 1;
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`Error al procesar producto ${product.id}: ${message}`);
      }
    }

    console.log(`Scraper completado: ${updatedCount} productos actualizados, ${errorCount} errores`);
  } finally {
    isRunning = false;
  }
};

export const runScraperNow = async (): Promise<void> => {
  await runScraperCycle();
};

export const startScraperJob = (): void => {
  cron.schedule(CRON_EXPRESSION, () => {
    void runScraperCycle();
  });
};
