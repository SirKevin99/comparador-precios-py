import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";

import { startScraperJob } from "./jobs/scraper.job";
import apiRoutes from "./routes";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "api-rest" });
});

app.use("/api", apiRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  startScraperJob();
  console.log("Scraper job iniciado - ejecuta cada 6 horas");
});
