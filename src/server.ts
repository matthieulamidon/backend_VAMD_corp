import express from "express";
import bodyParser from "body-parser";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";

export const startServer = () => {
  const app = express();
  app.use(bodyParser.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);

  app.use((err: any, req: any, res: any) => {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal error" });
  });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};
