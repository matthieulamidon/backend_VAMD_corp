//import prisma from "../prisma";
import { Request, Response } from "express";
import prisma from "../prisma";
import { JeuxEquipe, Poste } from "@prisma/client";

/* CreateEquipe: fonction qui permet de créé une équipe */
export async function CreateEquipe(req: Request, res: Response) {
  const { nom_equipe, jeux_equipe } = req.body;

  if (!nom_equipe || !jeux_equipe) {
    return res.status(400).json({
      message: "Le nom de l'équipe et/ou le jeu sont manquants ou invalides",
    });
  }
  console.log("Création d'une nouvelle équipe", nom_equipe, jeux_equipe);
  try {
    const existing = await prisma.equipe.findUnique({ where: { nom_equipe } });
    if (existing) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    if (Object.values(JeuxEquipe).includes(jeux_equipe) === false) {
      return res
        .status(400)
        .json({ message: "Le jeu de l'équipe est invalide" });
    }

    await prisma.equipe.create({
      data: {
        nom_equipe,
        jeux_equipe,
      },
    });
    return res.status(201).json({
      user: {
        nom_equipe: nom_equipe,
        jeux_equipe: jeux_equipe,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* getAllEquipe: fonction qui permet de recupérer toute les équipes */
export async function getAllEquipe(req: Request, res: Response) {
  const equipes = await prisma.equipe.findMany();
  return res.status(200).json(equipes);
}

/* DeleteEquipe: fonction qui permet de recupérer toute les équipes et le jeux qui est lier */
export async function DeleteEquipe(req: Request, res: Response) {
  const { nom_equipe } = req.body;

  if (!nom_equipe) {
    return res.status(400).json({
      message: "Le nom de l'équipe est manquant ou invalide",
    });
  }
  try {
    const existing = await prisma.equipe.findUnique({ where: { nom_equipe } });
    if (!existing) {
      return res.status(404).json({ message: "Cette équipe n'existe pas" });
    }
    await prisma.equipe.delete({ where: { nom_equipe } });
    return res.status(200).json({ message: "Équipe supprimée avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* UpdateEquipe: fonction qui permet de mettre a jour une équipe */
export async function UpdateEquipe(req: Request, res: Response) {
  const { nom_equipe, new_nom_equipe, new_jeux_equipe } = req.body;
  if (!nom_equipe || !new_nom_equipe || !new_jeux_equipe) {
    return res.status(400).json({
      message:
        "Le nom de l'équipe et/ou le nouveau nom de l'équipe et/ou le nouveau jeu sont manquants ou invalides",
    });
  }
  try {
    const existing = await prisma.equipe.findUnique({ where: { nom_equipe } });
    if (!existing) {
      return res.status(404).json({ message: "Cette équipe n'existe pas" });
    }
    await prisma.equipe.update({
      where: { nom_equipe },
      data: {
        nom_equipe: new_nom_equipe,
        jeux_equipe: new_jeux_equipe,
      },
    });
    return res.status(200).json({
      message: "Équipe mise à jour avec succès",
      equipe: {
        nom_equipe: new_nom_equipe,
        jeux_equipe: new_jeux_equipe,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* getAllDemandeForOneEquipe: fonction qui permet de récupérer toute les demandes d'insciption dans une équipe */
export async function getAllDemandeForOneEquipe(req: Request, res: Response) {
  const { nom_equipe } = req.params;
  if (!nom_equipe) {
    return res.status(400).json({
      message: "Le nom de l'équipe est manquant ou invalide",
    });
  }
  try {
    const equipe = await prisma.equipe.findUnique({
      where: { nom_equipe: nom_equipe },
    });

    const demandesJoueur = await prisma.userEquipe.findMany({
      where: { id_equipe: equipe?.id_equipe, sous_role: "INSCRIPTION" },
    });

    const demandesCoach = await prisma.inscriptionCoach.findMany({
      where: { jeu: equipe?.jeux_equipe },
    });

    return res.status(200).json({
      demandesJoueur: { demandesJoueur },
      demandesCoach: { demandesCoach },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* getAllDemandeEquipe: fonction qui permet de récupérer toute les demandes d'insciption Pour toute les user */
export async function getAllDemandeEquipe(req: Request, res: Response) {
  try {
    const demandesJoueur = await prisma.userEquipe.findMany({
      where: { sous_role: "INSCRIPTION" },
    });
    const demandesCoach = await prisma.inscriptionCoach.findMany();

    const infoJoueur = await Promise.all(
      demandesJoueur.map(async (demande) => {
        const user = await prisma.user.findUnique({
          where: { id_user: demande.id_user },
        });
        return { ...demande, user };
      })
    );

    const infoCoach = await Promise.all(
      demandesCoach.map(async (demande) => {
        const user = await prisma.user.findUnique({
          where: { id_user: demande.id_user },
        });
        return { ...demande, user };
      })
    );

    return res.status(200).json({
      demandesJoueur: { infoJoueur },
      demandesCoach: { infoCoach },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* acceptDemandeJoueur: fonction qui permet d'accepter une demande d'inscription dans une équipe Pour les joueur il seront mis en tant que membre du club*/
export async function acceptDemandeJoueur(req: Request, res: Response) {
  const { id_user, id_equipe } = req.body;
  if (!id_user || !id_equipe) {
    return res.status(400).json({
      message: "L'ID utilisateur et/ou l'ID équipe sont manquants ou invalides",
    });
  }
  try {
    const demande = await prisma.userEquipe.findFirst({
      where: {
        id_user: id_user,
        id_equipe: id_equipe,
        sous_role: "INSCRIPTION",
      },
    });
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }
    await prisma.userEquipe.update({
      where: { id_user_id_equipe: { id_user: id_user, id_equipe: id_equipe } },
      data: { sous_role: "MEMBRE" },
    });

    await prisma.user.update({
      where: { id_user: id_user },
      data: { id_droit: 4 }, //ont lui donne les droit de Joueur
    });

    return res.status(200).json({ message: "Demande acceptée avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* acceptDemandeCoach: fonction qui permet d'accepter une demande d'inscription dans une équipe Pour les coach */
export async function acceptDemandeCoach(req: Request, res: Response) {
  const { nom_equipe, id_user } = req.body;
  if (!nom_equipe) {
    return res.status(400).json({
      message: "L'ID inscription est manquant ou invalide",
    });
  }
  try {
    const demande = await prisma.equipe.findUnique({
      where: { nom_equipe: nom_equipe },
    });
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    await prisma.userEquipe.create({
      data: {
        id_user: id_user,
        id_equipe: demande.id_equipe,
        poste: Poste.COACH,
        sous_role: "COACH",
      },
    });

    await prisma.user.update({
      where: { id_user: id_user },
      data: { id_droit: 3 }, //ont lui donne les droit de Joueur
    });

    await prisma.inscriptionCoach.delete({
      where: { id_user: id_user },
    });
    return res.status(200).json({ message: "Demande acceptée avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* refuseDemandeJoueur: fonction qui permet de refuser une demande d'inscription dans une équipe Pour les joueur */
export async function refuseDemandeJoueur(req: Request, res: Response) {
  const { id_user, id_equipe } = req.body;
  if (!id_user || !id_equipe) {
    return res.status(400).json({
      message: "L'ID utilisateur et/ou l'ID équipe sont manquants ou invalides",
    });
  }
  try {
    const demande = await prisma.userEquipe.findFirst({
      where: {
        id_user: id_user,
        id_equipe: id_equipe,
        sous_role: "INSCRIPTION",
      },
    });
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }
    await prisma.userEquipe.delete({
      where: { id_user_id_equipe: { id_user: id_user, id_equipe: id_equipe } },
    });
    return res.status(200).json({ message: "Demande refusée avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* refuseDemandeCoach: fonction qui permet de refuser une demande d'inscription dans une équipe Pour les coach */
export async function refuseDemandeCoach(req: Request, res: Response) {
  const { id_user } = req.body;
  if (!id_user) {
    return res.status(400).json({
      message: "L'ID inscription est manquant ou invalide",
    });
  }
  try {
    const demande = await prisma.inscriptionCoach.findUnique({
      where: { id_user: id_user },
    });
    if (!demande) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }
    await prisma.inscriptionCoach.delete({
      where: { id_user: id_user },
    });
    return res.status(200).json({ message: "Demande refusée avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* assignEquipeToUserByAdmin: permet d'assigner une équipe à un utilisateur par un admin avec le role coach */
export async function assignEquipeToUserByAdmin(req: Request, res: Response) {
  try {
    const { id_user, nom_equipe } = req.body;
    const equipe = await prisma.equipe.findUnique({
      where: { nom_equipe: nom_equipe },
    });
    if (!equipe) {
      return res.status(404).json({ message: "Équipe non trouvée" });
    }
    await prisma.user.update({
      where: { id_user: id_user },
      data: { id_droit: 3 },
    });

    await prisma.userEquipe.create({
      data: {
        id_user: id_user,
        id_equipe: equipe.id_equipe,
        poste: "COACH",
        sous_role: "COACH",
      },
    });
    return res
      .status(200)
      .json({ message: "Équipe assignée à l'utilisateur avec succès" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
