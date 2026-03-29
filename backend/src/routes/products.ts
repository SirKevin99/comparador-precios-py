import { Router } from "express";
import { body } from "express-validator";

import { createProduct, getProductById, searchProducts } from "../controllers/products.controller";

const router = Router();

router.get("/search", searchProducts);
router.get("/:id", getProductById);

router.post(
  "/",
  [
    body("store_id").notEmpty().withMessage("store_id is required"),
    body("name").notEmpty().withMessage("name is required"),
    body("url").notEmpty().withMessage("url is required").isURL().withMessage("url must be valid"),
    body("current_price")
      .notEmpty()
      .withMessage("current_price is required")
      .isFloat({ min: 0 })
      .withMessage("current_price must be a positive number")
  ],
  createProduct
);

export default router;
