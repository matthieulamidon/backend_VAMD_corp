import { Request, Response } from "express";
import { PrismaClient, DroitEnum } from "@prisma/client";
import { verifyAuthCookie } from "../utils/jwt";

const prisma = new PrismaClient();

// 🔥 Normalisation des jeux
const normalizeGameEnum = (
  game: string
): "LEAGUEOFLEGENDES" | "VALORANT" | "FORTNITE" => {
  const t = game.toLowerCase().trim();
  if (t.includes("lol") || t.includes("league")) return "LEAGUEOFLEGENDES";
  if (t.includes("valo") || t.includes("valorant")) return "VALORANT";
  if (t.includes("fort") || t === "fn") return "FORTNITE";
  return "LEAGUEOFLEGENDES";
};

// ------------------- CREATE EVENT -------------------
export async function createEvent(req: Request, res: Response) {
  try {
    // verifyAuthCookie est un helper qui renvoie le payload décodé
    const decoded = verifyAuthCookie(req);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("role" in decoded) ||
      !("userId" in decoded)
    ) {
      return res.status(401).json({ message: "Authentification invalide" });
    }

    // ⚠️ adapte ce test à la valeur réelle de ton rôle COACH en base (id_droit)
    if (decoded.role !== 3) {
      return res
        .status(403)
        .json({ message: "Accès refusé : rôle COACH requis" });
    }

    const {
      titre_event,
      type_event,
      date_heure_debut,
      date_heure_fin,
      lieu,
      description,
      userIds,
      equipeIds,
    } = req.body;

    if (
      !titre_event ||
      !type_event ||
      !date_heure_debut ||
      !date_heure_fin ||
      !lieu
    ) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const start = new Date(date_heure_debut);
    const end = new Date(date_heure_fin);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json({ message: "Format de date invalide (ISO attendu)" });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({ message: "La date de fin doit être après la date de début" });
    }

    if (start < new Date()) {
      return res
        .status(400)
        .json({ message: "La date de début doit être dans le futur" });
    }

    // Création de l'événement
    const event = await prisma.evenement.create({
      data: {
        titre_event,
        type_event: normalizeGameEnum(type_event),
        date_heure_debut: start,
        date_heure_fin: end,
        lieu,
        description: description ?? null,
        id_user: decoded.userId,
      },
    });

    // ---------------- Participations joueurs ----------------
    if (Array.isArray(userIds) && userIds.length > 0) {
      // Vérifier que les users existent
      const existingUsers = await prisma.user.findMany({
        where: { id_user: { in: userIds } },
        select: { id_user: true },
      });

      const existingIds = existingUsers.map((u) => u.id_user);
      const missingIds = userIds.filter(
        (id: number) => !existingIds.includes(id)
      );

      if (missingIds.length > 0) {
        return res.status(400).json({
          message: "Certains utilisateurs n'existent pas",
          missingIds,
        });
      }

      const participationData = existingIds.map((userId: number) => ({
        id_event: event.id_event,
        id_user: userId,
        droit: DroitEnum.JOUEUR, // ✅ enum Prisma
      }));

      await prisma.participation.createMany({ data: participationData });
    }

    // ---------------- Participations équipes ----------------
    if (Array.isArray(equipeIds) && equipeIds.length > 0) {
      // Vérifier que les équipes existent
      const existingEquipes = await prisma.equipe.findMany({
        where: { id_equipe: { in: equipeIds } },
        select: { id_equipe: true },
      });

      const existingEquipeIds = existingEquipes.map((e) => e.id_equipe);
      const missingEquipeIds = equipeIds.filter(
        (id: number) => !existingEquipeIds.includes(id)
      );

      if (missingEquipeIds.length > 0) {
        return res.status(400).json({
          message: "Certaines équipes n'existent pas",
          missingEquipeIds,
        });
      }

      const participationEquipeData = existingEquipeIds.map(
        (teamId: number) => ({
          id_event: event.id_event,
          id_equipe: teamId,
        })
      );

      await prisma.participationEquipe.createMany({
        data: participationEquipeData,
      });
    }

    return res.status(201).json(event);
  } catch (err) {
    console.error("createEvent error:", err);
    return res.status(500).json({
      message: "Erreur serveur lors de la création de l'événement",
    });
  }
}

// ------------------- GET EVENTS POUR UN UTILISATEUR -------------------
export async function getUserEvents(req: Request, res: Response) {
  try {
    const decoded = await verifyAuthCookie(req);

    if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
      return res.status(401).json({ message: "Authentification invalide" });
    }

    const userId = decoded.userId;

    const userEquipes = await prisma.userEquipe.findMany({
      where: { id_user: userId },
      select: { id_equipe: true },
    });

    const equipeIds = userEquipes.map((equipe) => equipe.id_equipe);

    const events = await prisma.evenement.findMany({
      where: {
        OR: [
          { id_user: userId }, // coach créateur
          { participations: { some: { id_user: userId } } }, // joueur ciblé
          { participationEquipe: { some: { id_equipe: { in: equipeIds } } } }, // membre équipe ciblée
          { participations: { none: {} }, participationEquipe: { none: {} } }, // événement public
        ],
      },
      include: {
        coach: { select: { pseudo: true, email: true } },
        participations: { select: { user: { select: { pseudo: true } } } },
        participationEquipe: {
          select: { equipe: { select: { nom_equipe: true } } },
        },
      },
      orderBy: { date_heure_debut: "asc" },
    });

    return res.json(events);
  } catch (err) {
    console.error("getUserEvents error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// ------------------- DELETE EVENT -------------------
export async function deleteEventById(req: Request, res: Response) {
  try {
    const decoded = await verifyAuthCookie(req);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("role" in decoded) ||
      !("userId" in decoded)
    ) {
      return res.status(401).json({ message: "Authentification invalide" });
    }

    if (decoded.role !== 4) {
      return res
        .status(403)
        .json({ message: "Accès refusé : rôle COACH requis" });
    }

    const { id } = req.params;
    const eventId = Number(id);

    const event = await prisma.evenement.findUnique({
      where: { id_event: eventId },
    });
    if (!event)
      return res.status(404).json({ message: "Événement introuvable" });
    if (event.id_user !== decoded.userId)
      return res
        .status(403)
        .json({ message: "Vous ne pouvez supprimer que vos événements" });

    // Supprimer les participations liées
    await prisma.participation.deleteMany({ where: { id_event: eventId } });
    await prisma.participationEquipe.deleteMany({
      where: { id_event: eventId },
    });

    // Supprimer l'événement
    await prisma.evenement.delete({ where: { id_event: eventId } });

    return res.json({ message: "Événement supprimé avec succès" });
  } catch (err) {
    console.error("deleteEventById error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// ------------------- UPDATE EVENT -------------------
export async function updateEvent(req: Request, res: Response) {
  try {
    const decoded = await verifyAuthCookie(req);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("role" in decoded) ||
      !("userId" in decoded)
    ) {
      return res.status(401).json({ message: "Authentification invalide" });
    }

    if (decoded.role !== 4) {
      return res
        .status(403)
        .json({ message: "Accès refusé : rôle COACH requis" });
    }

    const { id } = req.params;
    const eventId = Number(id);
    const {
      titre_event,
      type_event,
      date_heure_debut,
      date_heure_fin,
      lieu,
      description,
      userIds,
      equipeIds,
    } = req.body;

    const existingEvent = await prisma.evenement.findUnique({
      where: { id_event: eventId },
    });
    if (!existingEvent)
      return res.status(404).json({ message: "Événement introuvable" });
    if (existingEvent.id_user !== decoded.userId)
      return res.status(403).json({
        message: "Vous ne pouvez modifier que vos propres événements",
      });

    const start = date_heure_debut
      ? new Date(date_heure_debut)
      : existingEvent.date_heure_debut;
    const end = date_heure_fin
      ? new Date(date_heure_fin)
      : existingEvent.date_heure_fin;

    if (start && end && end <= start) {
      return res
        .status(400)
        .json({ message: "La date de fin doit être après la date de début" });
    }

    // Mise à jour de l'événement
    const updatedEvent = await prisma.evenement.update({
      where: { id_event: eventId },
      data: {
        titre_event: titre_event ?? existingEvent.titre_event,
        type_event: type_event
          ? normalizeGameEnum(type_event)
          : existingEvent.type_event,
        date_heure_debut: start,
        date_heure_fin: end,
        lieu: lieu ?? existingEvent.lieu,
        description: description ?? existingEvent.description,
      },
    });

    // Mise à jour des participations joueurs
    if (Array.isArray(userIds)) {
      await prisma.participation.deleteMany({ where: { id_event: eventId } });
      if (userIds.length > 0) {
        const participationData = userIds.map((userId: number) => ({
          id_event: eventId,
          id_user: userId,
          droit: "JOUEUR" as const,
        }));
        await prisma.participation.createMany({ data: participationData });
      }
    }

    // Mise à jour des participations équipes
    if (Array.isArray(equipeIds)) {
      await prisma.participationEquipe.deleteMany({
        where: { id_event: eventId },
      });
      if (equipeIds.length > 0) {
        const participationEquipeData = equipeIds.map((teamId: number) => ({
          id_event: eventId,
          id_equipe: teamId,
        }));
        await prisma.participationEquipe.createMany({
          data: participationEquipeData,
        });
      }
    }

    return res.json(updatedEvent);
  } catch (err) {
    console.error("updateEvent error:", err);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la modification" });
  }
}

// ------------------- GET ALL PUBLIC EVENTS -------------------
export async function getPublicEvents(req: Request, res: Response) {
  try {
    const events = await prisma.evenement.findMany({
      where: {
        participations: { none: {} }, // pas de joueurs ciblés
        participationEquipe: { none: {} }, // pas d'équipes ciblées
      },
      include: {
        coach: { select: { pseudo: true, email: true } },
        participations: { select: { user: { select: { pseudo: true } } } },
        participationEquipe: {
          select: { equipe: { select: { nom_equipe: true } } },
        },
      },
      orderBy: { date_heure_debut: "asc" },
    });

    return res.json(events);
  } catch (err) {
    console.error("getPublicEvents error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
