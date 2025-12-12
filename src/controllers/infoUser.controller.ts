import { Request, Response } from "express";
import { Icone, PrismaClient, SexeEnum } from "@prisma/client";
import { verifyAuthCookie } from "../utils/jwt";
import {
  isDateGoodFormat,
  isEmailExist,
  isPseudoExist,
} from "../middleware/verificationExistance.middleware";

const prisma = new PrismaClient();

/* infoUser: permet de récupérer les informations de l'utilisateur connecté */
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

/* updateUser: permet de mettre à jour les informations de l'utilisateur connecté */
export async function updateUser(req: Request, res: Response) {
  let userData: any;
  try {
    userData = verifyAuthCookie(req);
  } catch (error) {
    console.error("Erreur de vérification du cookie :", error);
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }
  try {
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

    const dataToUpdate: any = {};
    // on met à jour uniquement les champs fournis dans la requête
    if (pseudo) dataToUpdate.pseudo = pseudo;
    if (email) {
      isEmailExist();
      dataToUpdate.email = email;
    }
    if (nom) dataToUpdate.nom = nom;
    if (prenom) dataToUpdate.prenom = prenom;
    if (date_naissance) {
      if (isDateGoodFormat(date_naissance) !== true) {
        return res.status(400).json(isDateGoodFormat(date_naissance));
      }
      dataToUpdate.date_naissance = new Date(date_naissance);
    }
    if (sexe) dataToUpdate.sexe = sexe;
    if (pseudo) {
      isPseudoExist();
      dataToUpdate.pseudo = pseudo;
    }

    if (icone) dataToUpdate.icone = icone;
    if (description) dataToUpdate.description = description;

    const updatedUser = await prisma.user.update({
      where: { id_user: userData.userId },
      data: dataToUpdate,
    });

    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.error("Erreur lors de la mise à jour :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

/* infoUserAndPerformance : permet de recuperer les tate de l'utilisateur et de les affichers*/
export async function infoUserAndPerformance(req: Request, res: Response) {
  console.log("infoUserAndPerformance called");
  try {
    const { nameUser, teamSelect } = req.body as {
      nameUser?: string;
      teamSelect?: string;
    };

    const userInfo = await prisma.user.findUnique({
      where: { pseudo: nameUser },
    });

    const KDAStats = "10/2/5"; // Valeur fictive pour l'exemple
    const nbDeGamesPlayed = 25; // Valeur fictive pour l'exemple

    const team = await prisma.equipe.findUnique({
      where: { nom_equipe: teamSelect },
    });

    const userTeamRelation = await prisma.userEquipe.findFirst({
      where: {
        id_user: userInfo?.id_user,
        id_equipe: team?.id_equipe,
      },
    });

    return res.status(200).json({
      userInfo,
      roleInTeam: userTeamRelation?.sous_role || "MEMBRE",
      posteInTeam: userTeamRelation
        ? userTeamRelation.poste
        : "Aucun poste défini",
      performance: {
        KDA: KDAStats,
        gamesPlayed: nbDeGamesPlayed,
      },
    });
  } catch (err) {
    console.error("Erreur lors de la récupération des informations :", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
