import { Request, Response } from "express";
import { validationResult } from "express-validator";

import { AlertCondition, UpdateAlertInput, alertsService } from "../services/alerts.service";

const VALID_CONDITIONS: AlertCondition[] = ["below", "above", "any"];

export const createOrUpdateAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const condition = (req.body.condition ?? "below") as AlertCondition;
    if (!VALID_CONDITIONS.includes(condition)) {
      res.status(400).json({ message: "condition must be one of: below, above, any" });
      return;
    }

    const parsedTargetPrice =
      req.body.target_price === null || req.body.target_price === undefined
        ? null
        : Number(req.body.target_price);

    if (condition !== "any" && (parsedTargetPrice === null || Number.isNaN(parsedTargetPrice))) {
      res.status(400).json({ message: "target_price is required unless condition is 'any'" });
      return;
    }

    const alert = await alertsService.upsertAlert({
      user_id: String(req.body.user_id),
      product_id: String(req.body.product_id),
      target_price: condition === "any" ? null : parsedTargetPrice,
      condition
    });

    res.status(201).json({ data: alert });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Failed to create or update alert", error: message });
  }
};

export const getAlertsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    if (!userId) {
      res.status(400).json({ message: "userId is required" });
      return;
    }

    const alerts = await alertsService.getAlertsByUserId(userId);
    res.status(200).json({ data: alerts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Failed to fetch alerts", error: message });
  }
};

export const updateAlert = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!id) {
      res.status(400).json({ message: "Alert id is required" });
      return;
    }

    const { is_active, target_price, condition } = req.body as UpdateAlertInput;

    if (condition && !VALID_CONDITIONS.includes(condition)) {
      res.status(400).json({ message: "condition must be one of: below, above, any" });
      return;
    }

    const parsedTargetPrice =
      target_price === null || target_price === undefined ? undefined : Number(target_price);
    if (parsedTargetPrice !== undefined && Number.isNaN(parsedTargetPrice)) {
      res.status(400).json({ message: "target_price must be a valid number or null" });
      return;
    }

    const updated = await alertsService.updateAlert(id, {
      is_active,
      target_price: target_price === undefined ? undefined : target_price === null ? null : parsedTargetPrice,
      condition
    });

    res.status(200).json({ data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ message: "Failed to update alert", error: message });
  }
};
