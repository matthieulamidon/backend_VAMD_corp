//todo les routes qui permettent la gestion des équipes par un admin
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/* infoUser: permet de récupérer les informations de l'utilisateur connecté */
export async function infoAllUserForAdmin(req: Request, res: Response) {
  try {
    const user = await prisma.user.findMany({});

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
