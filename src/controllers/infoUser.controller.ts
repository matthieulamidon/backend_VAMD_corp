import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyAuthCookie } from "../utils/jwt";

const prisma = new PrismaClient();

export async function infoUser(req: Request, res: Response) {
  let userData: any;
  try {
    userData = verifyAuthCookie(req);
  } catch (error) {
    console.error("Erreur de vérification du cookie :", error);
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id_user: userData.userId },
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
