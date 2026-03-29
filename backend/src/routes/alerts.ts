import { Router } from "express";
import { body, param } from "express-validator";

import { createOrUpdateAlert, getAlertsByUser } from "../controllers/alerts.controller";

const router = Router();

router.post(
  "/",
  [
    body("user_id").notEmpty().withMessage("user_id is required"),
    body("product_id").notEmpty().withMessage("product_id is required"),
    body("condition").optional().isIn(["below", "above", "any"]).withMessage("condition is invalid"),
    body("target_price")
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage("target_price must be a positive number")
  ],
  createOrUpdateAlert
);

router.get("/:userId", [param("userId").notEmpty().withMessage("userId is required")], getAlertsByUser);

export default router;
