import { Request, Response, NextFunction } from "express";
import { verifyAuthCookie, verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: any;
}

export function authenticateToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  console.log("Authenticating token for request:", req.method, req.url);

  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token" });

  /*
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer")
    return res.status(401).json({ message: "Malformed token" });

  const token = parts[1];
  */
  const token = verifyAuthCookie(req) as string;
  if (!token) return res.status(401).json({ message: "No token found" });

  try {
    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
