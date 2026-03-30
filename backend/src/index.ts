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
  "https://comparador-precios-fpecrp6qi-sirkevin99s-projects.vercel.app" 
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // permitir sin origin
      if (origin.endsWith(".vercel.app")) {    // cualquier subdominio de Vercel
        return callback(null, true);
      }
      callback(new Error(`CORS error: origin ${origin} not allowed`));
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
