import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { Request, Response } from "express";
type JwtTimeString = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN: JwtTimeString = (process.env.JWT_EXPIRES_IN ||
  "1h") as JwtTimeString;

/* signToken: permet de créer un token JWT avec un payload donné */
export function signToken(payload: object): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

/* verifyToken: permet de vérifier et décoder un token JWT */
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

/* setAuthCookie: Permet de créer un cookie sécurisé avec le token JWT */
export function setAuthCookie(res: Response, payload: object) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  const role = (payload as any).role || "USER";
  console.log(`Setting auth cookie for role: ${role}`);
  // cookie sécurisé

  res.cookie("auth_token", token, {
    httpOnly: true, // inaccessible au JS
    secure: process.env.MODE_PRODUCTION === "production", // HTTPS only en production sinon false
    sameSite: process.env.MODE_PRODUCTION === "production" ? "none" : "lax", // protège CSRF lax si tu es en prod car on est sur le localhost en dev sinon none car le frontend est sur Versell et le backend sur render
    path: "/",
    maxAge: 60 * 60 * 1000, // 1h
  });
  return token;
}

/* verifyAuthCookie: Permet de vérifier le token JWT depuis le cookie et retourne le pseudo, id et role de l'utilisateur */
export function verifyAuthCookie(req: Request) {
  const token = req.cookies?.auth_token;
  console.log("Auth cookie token:", token, req.cookies);
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, JWT_SECRET);
}

/* clearAuthCookie : Permet de supprimer le cookie d'authentification */
export function clearAuthCookie(res: Response) {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.MODE_PRODUCTION === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
}
