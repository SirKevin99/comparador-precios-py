import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";

import { startScraperJob } from "./jobs/scraper.job";
import apiRoutes from "./routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Lista de orígenes permitidos explícitos (desarrollo y frontend principal)
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

app.use(helmet());
app.use(express.json());

// Ruta de healthcheck
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, service: "api-rest" });
});

// Middleware para manejo de query vacía en búsqueda de productos
app.get("/api/products/search", (req, res) => {
  const { q } = req.query;

  if (!q || q.toString().trim() === "") {
    return res.status(400).json({ error: "Query 'q' is required" });
  }

  // Aquí llamas a tu lógica real de búsqueda
  res.json({ results: [] });
});

// Rutas principales
app.use("/api", apiRoutes);

// Manejo de rutas no encontradas
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Arranque del servidor
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`); // sin localhost
  //startScraperJob();
  console.log("Scraper job iniciado - ejecuta cada 6 horas");
});