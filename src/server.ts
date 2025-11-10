import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import infoUserRoutes from "./routes/infoUser.routes";
import inscryptionEquipeRoutes from "./routes/inscryptionEquipe.routes";
import cors from "cors";
import cookieParser from "cookie-parser";

export const startServer = () => {
  const app = express();

  app.use(cookieParser());
  app.use(bodyParser.json());

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173", // URL du frontend car sinon CORS bloque I HATE YOU CORS !!!
      credentials: true, // les cookies
    })
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/user", infoUserRoutes);
  app.use("/api/equipeInscryption", inscryptionEquipeRoutes);

  app.use((err: any, req: any, res: any) => {
    console.error("🔥 Erreur capturée :", err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Erreur interne du serveur" });
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};
