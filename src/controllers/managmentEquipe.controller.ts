import { Request, Response } from "express";
import prisma from "../prisma";
import { verifyAuthCookie } from "../utils/jwt";
import { Poste, SousRole } from "@prisma/client";

// TODO: créé les routes qui permettent aux joueurs et au coachs de gérer les équipes (Page joueur/coach)

/* getAllEquipeOfPlayer: fonction qui permet de renvoiyer une liste de toute les équipes dans laquel tu es inscries */
export async function getAllEquipeOfPlayer(req: Request, res: Response) {
  let userData: any;
  try {
    userData = verifyAuthCookie(req);
  } catch (error) {
    console.error("Erreur de vérification du cookie :", error);
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  try {
    const existing = await prisma.userEquipe.findMany({
      where: { id_user: userData.id_user },
    });

    if (existing.length === 0) {
      return res.status(200).json({ equipes: [] });
    }

    const equipes = await prisma.equipe.findMany({
      where: { id_equipe: { in: existing.map((ue) => ue.id_equipe) } },
    });

    const equipesName = equipes.map((equipe) => equipe.nom_equipe);

    return res.status(200).json({
      equipes: equipesName,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Fonction utilitaire pour transformer l'ENUM Prisma en clé pour le Frontend
const mapPosteToKey = (posteEnum: string): string => {
  switch (posteEnum) {
    // VALORANT
    case "DUELISTS":
      return "duelist";
    case "SENTINELS":
      return "sentinel";
    case "INITIATORS":
      return "initiator";
    case "CONTROLLERS":
      return "controller";
    case "POLYVALENT":
      return "flex";
    // LOL
    case "TOPLANER":
      return "top";
    case "MIDLANER":
      return "mid";
    case "BOTLANER":
      return "adc"; // ou bot
    case "JUNGLER":
      return "jungle";
    case "SUPORT":
      return "support";
    default:
      return posteEnum.toLowerCase();
  }
};

/* getAllDemandeEquipe: fonction qui permet de récupérer toute les demandes d'insciption Pour une équipe */
export async function getJoueurEquipePosition(req: Request, res: Response) {
  console.log("Requête reçue pour getJoueurEquipePosition avec le body :");
  const { equipe_name } = req.body;

  if (!equipe_name) {
    return res.status(400).json({ message: "Le nom de l'équipe est requis." });
  }

  try {
    const equipe = await prisma.equipe.findUnique({
      where: { nom_equipe: equipe_name },
      include: {
        userEquipes: {
          include: {
            user: {
              select: {
                pseudo: true,
                icone: true,
              },
            },
          },
        },
      },
    });

    if (!equipe) {
      return res.status(404).json({ message: "Équipe introuvable" });
    }

    const mainTeam: Record<string, string> = {};
    let coachData: any = null;
    const subsData: any[] = [];
    const staffData: any[] = [];

    console.log("Membres de l'équipe récupérés :", equipe.userEquipes);
    equipe.userEquipes.forEach((membre) => {
      const pseudo = membre.user?.pseudo || "Inconnu";
      const avatar = membre.user?.icone || "AVATAR1";

      const positionKey = mapPosteToKey(membre.poste);

      switch (membre.sous_role) {
        case "TITULAIRE":
          mainTeam[positionKey] = pseudo;
          break;

        case "REMPLACANT":
          subsData.push({
            name: pseudo,
            roleName: `${positionKey} Sub`,
            icon: avatar,
          });
          break;

        case "COACH":
          coachData = {
            name: pseudo,
            roleName: "Head Coach",
            icon: avatar,
          };
          break;

        case "CHEFDEQUIPE":
          staffData.push({
            name: pseudo,
            roleName: "General Manager",
            icon: avatar,
          });
          break;

        case "MEMBRE":
        default:
          staffData.push({
            name: pseudo,
            roleName: "Staff",
            icon: avatar,
          });
          break;
      }
    });
    console.log("voici", mainTeam, coachData, subsData, staffData);

    return res.status(200).json({
      gameName: equipe.jeux_equipe,
      mainTeam: mainTeam,
      coachData: coachData,
      subsData: subsData,
      staffData: staffData,
    });
  } catch (err) {
    console.error("Erreur getJoueurEquipePosition:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// Interface attendue du Frontend
interface PlayerUpdate {
  pseudo: string;
  poste: string; // ex: "duelist" ou "DUELISTS"
  sous_role: string; // ex: "TITULAIRE"
}

// oui j'ai demandé à chatgpt de m'écrire ça :'( car je commence a manquer de temps

// Fonction utilitaire pour convertir les strings du front vers l'Enum Prisma
// (Car le front envoie souvent "duelist" mais la BDD veut "DUELISTS")
const normalizePoste = (val: string): Poste => {
  const upper = val.toUpperCase();
  // VALORANT
  if (upper.includes("DUELIST")) return "DUELISTS";
  if (upper.includes("SENTINEL")) return "SENTINELS";
  if (upper.includes("INITIATOR")) return "INITIATORS";
  if (upper.includes("CONTROLLER")) return "CONTROLLERS";
  if (upper.includes("FLEX") || upper.includes("POLY")) return "POLYVALENT";
  // LOL
  if (upper === "TOP" || upper === "TOPLANER") return "TOPLANER";
  if (upper === "JUNGLE" || upper === "JUNGLER") return "JUNGLER";
  if (upper === "MID" || upper === "MIDLANER") return "MIDLANER";
  if (upper === "ADC" || upper === "BOT" || upper === "BOTLANER")
    return "BOTLANER";
  if (upper === "SUP" || upper === "SUPPORT") return "SUPORT"; // je suis désolé pour cette faute d'orthographe mais j'ai la flemme de tout renommer

  return upper as Poste;
};

// Fonction utilitaire pour convertir les strings du front vers l'Enum Prisma
const normalizeSousRole = (val: string): SousRole => {
  const upper = val.toUpperCase();
  if (upper === "MAIN" || upper === "TITULAIRE") return "TITULAIRE";
  if (upper === "SUB" || upper === "REMPLACANT") return "REMPLACANT";
  if (upper === "COACH") return "COACH";
  if (upper === "CHEF" || upper === "CHEFDEQUIPE") return "CHEFDEQUIPE";
  return "MEMBRE";
};

/* updateEquipePositions: fonction qui permet de mettre à jour les postes et rôles des joueurs dans une équipe */
export async function updateEquipePositions(req: Request, res: Response) {
  const {
    equipe_name,
    updates,
  }: { equipe_name: string; updates: PlayerUpdate[] } = req.body;

  if (!equipe_name || !updates || !Array.isArray(updates)) {
    return res.status(400).json({
      message:
        "Données invalides (nom d'équipe ou liste de mises à jour manquante).",
    });
  }

  try {
    // 1. Trouver l'équipe pour avoir son ID
    const equipe = await prisma.equipe.findUnique({
      where: { nom_equipe: equipe_name },
      select: { id_equipe: true },
    });

    if (!equipe) {
      return res.status(404).json({ message: "Équipe introuvable." });
    }

    // 2. Préparer les promesses de mise à jour
    // On doit d'abord trouver les ID des users car la table de liaison utilise id_user, pas le pseudo
    const userPseudos = updates.map((u) => u.pseudo);

    const usersFound = await prisma.user.findMany({
      where: { pseudo: { in: userPseudos } },
      select: { id_user: true, pseudo: true },
    });

    // On prépare la Transaction
    const transactionOperations = updates
      .map((updateData) => {
        const user = usersFound.find((u) => u.pseudo === updateData.pseudo);

        if (!user) {
          // Si un user n'est pas trouvé, on l'ignore ou on throw une erreur (ici on ignore pour ne pas bloquer tout le monde)
          console.warn(`Utilisateur ${updateData.pseudo} introuvable, ignoré.`);
          return null;
        }

        // Conversion des Strings en Enums Prisma
        const newPoste = normalizePoste(updateData.poste);
        const newSousRole = normalizeSousRole(updateData.sous_role);

        return prisma.userEquipe.update({
          where: {
            id_user_id_equipe: {
              id_user: user.id_user,
              id_equipe: equipe.id_equipe,
            },
          },
          data: {
            poste: newPoste,
            sous_role: newSousRole,
          },
        });
      })
      .filter((op) => op !== null); // On retire les nulls (users pas trouvés)

    // 3. Exécuter la transaction
    if (transactionOperations.length > 0) {
      // @ts-ignore (Parfois TypeScript râle sur le filter, mais c'est safe)
      await prisma.$transaction(transactionOperations);
    }

    return res
      .status(200)
      .json({ message: "Mise à jour de l'équipe effectuée avec succès !" });
  } catch (err) {
    console.error("Erreur updateEquipePositions:", err);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la mise à jour." });
  }
}
