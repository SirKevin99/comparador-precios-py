import { supabase } from "../config/supabase";
import { Product } from "./products.service";

export type AlertCondition = "below" | "above" | "any";

export interface Alert {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number | null;
  condition: AlertCondition;
  is_active: boolean;
  last_notified_at: string | null;
  products?: Product;
}

export interface UpsertAlertInput {
  user_id: string;
  product_id: string;
  target_price: number | null;
  condition: AlertCondition;
}

class AlertsService {
  async upsertAlert(input: UpsertAlertInput): Promise<Alert> {
    const payload = {
      user_id: input.user_id,
      product_id: input.product_id,
      target_price: input.condition === "any" ? null : input.target_price,
      condition: input.condition,
      is_active: true
    };

    const { data, error } = await supabase
      .from("alerts")
      .upsert(payload, { onConflict: "user_id,product_id" })
      .select("*, products (*)")
      .single();

    if (error) {
      throw new Error(`Supabase upsertAlert error: ${error.message}`);
    }

    return data as Alert;
  }

  async getAlertsByUserId(userId: string): Promise<Alert[]> {
    const { data, error } = await supabase
      .from("alerts")
      .select("*, products (*)")
      .eq("user_id", userId)
      .order("is_active", { ascending: false });

    if (error) {
      throw new Error(`Supabase getAlertsByUserId error: ${error.message}`);
    }

    return (data ?? []) as Alert[];
  }
}

export const alertsService = new AlertsService();
