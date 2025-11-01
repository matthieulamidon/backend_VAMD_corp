import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { Request, Response } from "express";
type JwtTimeString = `${number}${"s" | "m" | "h" | "d" | "w" | "y"}`;

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN: JwtTimeString = (process.env.JWT_EXPIRES_IN ||
  "1h") as JwtTimeString;

// permet de créer un token JWT avec un payload donné
export function signToken(payload: object): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

// permet de vérifier et décoder un token JWT
export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

// Permet de créer un cookie sécurisé avec le token JWT
export function setAuthCookie(res: Response, payload: object) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  const role = (payload as any).role || "USER";
  console.log(`Setting auth cookie for role: ${role}`);
  // cookie sécurisé

  res.cookie("auth_token", token, {
    httpOnly: false, //true, // inaccessible au JS
    secure: false, //process.env.MODE_PRODUCTION === "production", // HTTPS only
    sameSite: "lax", //process.env.NODE_ENV === "production" ? "strict" : "none", // protège CSRF
    maxAge: 60 * 60 * 1000, // 1h
  });

  return token;
}

// Permet de vérifier le token JWT depuis le cookie
export function verifyAuthCookie(req: Request) {
  console.log("Verifying auth cookie for request:", req.method, req.url);
  const token = req.cookies?.auth_token;
  console.log("Auth cookie token:", token, req.cookies);
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, JWT_SECRET);
}
