import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export function requireRole(requiredRole: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    // user.role doit venir du payload JWT (dans signToken on met role)
    if (user.role !== requiredRole) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}

// exemple plus flexible pour plusieurs rôles
export function requireAnyRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    if (!roles.includes(user.role))
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    next();
  };
}
