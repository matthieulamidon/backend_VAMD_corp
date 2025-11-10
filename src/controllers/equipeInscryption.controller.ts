import { Request, Response } from "express";
import prisma from "../prisma";
import { JeuxEquipe, SousRole } from "@prisma/client";
import { isAuthantificate } from "../middleware/verificationExistance.middleware";

/* getTeamAndGame: permet de récupérer les noms des équipes et les jeux associés au format json */
export async function getTeamAndGame(req: Request, res: Response) {
  const equipes = await prisma.equipe.findMany({
    select: {
      nom_equipe: true,
      jeux_equipe: true,
    },
  });

  const result: Record<JeuxEquipe, string[]> = {
    [JeuxEquipe.LEAGUEOFLEGENDES]: [],
    [JeuxEquipe.VALORANT]: [],
    [JeuxEquipe.FORTNITE]: [],
  };

  for (const equipe of equipes) {
    result[equipe.jeux_equipe].push(equipe.nom_equipe);
  }

  return res.status(200).json(result);
}

/* getInfoUserForComplete: permet de récupérer les infos de l'utilisateur pour la page d'inscription a l'équipe */
export async function getInfoUserForComplete(req: Request, res: Response) {
  let userData: any;
  userData = isAuthantificate(req);

  if (userData.message) {
    return res.status(401).json({ message: userData.message });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id_user: userData.userId },
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    return res
      .status(200)
      .json({ name: user.nom, firstName: user.prenom, sexe: user.sexe });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

/* completeProfile: permet de compléter le profil de l'utilisateur au niveau de l'inscription à une équipe*/
export async function completeProfile(req: Request, res: Response) {
  let userData: any;
  userData = isAuthantificate(req);

  if (userData.message) {
    return res.status(401).json({ message: userData.message });
  }

  try {
    const { name, firstName, sexe } = req.body;

    if (!name || !firstName || !sexe) {
      return res
        .status(400)
        .json({ message: "Tous les champs doivent être remplis" });
    }
    await prisma.user.update({
      where: { id_user: userData.userId },
      data: {
        nom: name,
        prenom: firstName,
        sexe: sexe,
      },
    });
    return res.status(200).json({ message: "Profil complété avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

/* inscryptionEquipe: permet d'inscrire un utilisateur dans une équipe */
export async function inscryptionEquipe(req: Request, res: Response) {
  let userData: any;
  userData = isAuthantificate(req);
  if (userData.message) {
    return res.status(401).json({ message: userData.message });
  }
  try {
    // Récupérer les données de la requête
    const { nameEquipe, post } = req.body;
    if (!nameEquipe) {
      return res
        .status(400)
        .json({ message: "aucune equipe a été selectionné" });
    }
    const equipe = await prisma.equipe.findUnique({
      where: { nom_equipe: nameEquipe },
    });
    if (!equipe) {
      return res.status(404).json({ message: "équipe non trouvée" });
    }

    await prisma.userEquipe.create({
      data: {
        id_user: userData.userId,
        id_equipe: equipe.id_equipe,
        poste: post,
        sous_role: SousRole.INSCRIPTION,
      },
    });

    // Mettre à jour l'utilisateur avec le nom de l'équipe
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
