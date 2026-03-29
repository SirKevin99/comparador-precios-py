import { Router } from "express";
import alertsRouter from "./alerts";
import productsRouter from "./products";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({ message: "API ready" });
});
router.use("/alerts", alertsRouter);
router.use("/products", productsRouter);

export default router;
