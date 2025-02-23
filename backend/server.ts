import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import projectRoutes from "./routes/projectsRoute";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/projects", projectRoutes);

// Middleware de gestion des erreurs
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion MongoDB:", err));

// Démarrer le serveur
app.listen(PORT, () => console.log(`🚀 Serveur backend lancé sur le port ${PORT}`));
