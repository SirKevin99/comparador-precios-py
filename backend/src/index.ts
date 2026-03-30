import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";

import { startScraperJob } from "./jobs/scraper.job";
import apiRoutes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "https://comparador-precios-py.vercel.app",
  process.env.FRONTEND_URL || ""
];

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isVercel = origin.endsWith(".vercel.app");
      const isAllowed = allowedOrigins.includes(origin);
      if (isVercel || isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);
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
