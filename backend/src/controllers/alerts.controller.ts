import { Request, Response } from "express";
import { validationResult } from "express-validator";

import { AlertCondition, alertsService } from "../services/alerts.service";

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
