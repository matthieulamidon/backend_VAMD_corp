import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { verifyAuthCookie } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const router = Router();

router.get("/admin", authenticateToken, (req: Request, res: Response) => {
  console.log("Accessing /admin route");

  res.json({
    message: "Bienvenue admin !",
    user: req.user, // maintenant reconnu par TS
  });
});

router.get("/cookie", (req, res) => {
  try {
    const user = verifyAuthCookie(req);
    if (
      typeof user === "object" &&
      "role" in user &&
      (user as any).role === "ADMIN"
    ) {
      res.send("Bienvenue, seigneur ADMIN !");
    } else {
      return res.status(403).send("Forbidden");
    }
  } catch {
    res.status(401).send("Unauthorized");
  }
});

export default router;
