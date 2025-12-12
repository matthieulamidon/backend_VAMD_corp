//todo les routes qui permettent la gestion des équipes par un admin
import { Request, Response } from "express";
import { Icone, PrismaClient, SexeEnum } from "@prisma/client";

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

/* deleteUserByAdmin: permet de supprimer un utilisateur par un admin */
export async function deleteUserByAdmin(req: Request, res: Response) {
  try {
    const { id_user } = req.params;
    await prisma.user.delete({
      where: { id_user: Number(id_user) },
    });
    return res
      .status(200)
      .json({ message: "Utilisateur supprimé avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

/* updateUserByAdmin: permet de mettre à jour les informations d'un utilisateur par un admin */
export async function updateUserByAdmin(req: Request, res: Response) {
  try {
    const { id_user } = req.params;
    const {
      email,
      nom,
      prenom,
      date_naissance,
      sexe,
      pseudo,
      icone,
      description,
    } = req.body as {
      email?: string;
      nom?: string;
      prenom?: string;
      date_naissance?: string | Date;
      sexe?: SexeEnum;
      pseudo?: string;
      icone?: Icone;
      description?: string;
    };
    await prisma.user.update({
      where: { id_user: Number(id_user) },
      data: {
        email,
        nom,
        prenom,
        date_naissance,
        sexe,
        pseudo,
        icone,
        description,
      },
    });
    return res
      .status(200)
      .json({ message: "Utilisateur mis à jour avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
