import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyAuthCookie } from "../utils/jwt";

const prisma = new PrismaClient();

export async function createEvent(req: Request, res: Response) {
  try {
    console.log("Avant verifyAuthCookie");
    const decoded = await verifyAuthCookie(req);
    console.log("Après verifyAuthCookie:", decoded);

    const {
      titre_event,
      type_event,
      date_heure_debut,
      date_heure_fin,
      lieu,
      description,
    } = req.body;

    // vérifications sur le token décodé
    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("role" in decoded) ||
      !("userId" in decoded)
    ) {
      return res.status(401).json({ message: "Authentification invalide" });
    }

    // vérifie que c’est bien un coach
    if (decoded.role !== 4) {
      return res
        .status(403)
        .json({ message: "Accès refusé : rôle COACH requis" });
    }
    // champs obligatoires
    if (
      !titre_event ||
      !type_event ||
      !date_heure_debut ||
      !date_heure_fin ||
      !lieu
    ) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    // validation des dates
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
    console.log("Avant création event");
    const event = await prisma.evenement.create({
      data: {
        titre_event,
        type_event,
        date_heure_debut: start,
        date_heure_fin: end,
        lieu,
        description: description ?? null,
        id_user: decoded.id_user,
      },
    });

    return res.status(201).json(event);
  } catch (err) {
    console.error("createEvent error:", err);
    return res
      .status(500)
      .json({ message: "Erreur serveur lors de la création de l'événement" });
  }
}
//recupérer la liste des événements
export async function getEvents(req: Request, res: Response) {
  try {
    const events = await prisma.evenement.findMany({
      include: {
        coach: {
          select: { pseudo: true, email: true },
        },
      },
      orderBy: {
        date_heure_debut: "asc",
      },
    });

    return res.json(events);
  } catch (err) {
    console.error("getEvents error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
//  Récupérer les événements du coach connecté
export async function getCoachEvents(req: Request, res: Response) {
  try {
    const decoded = await verifyAuthCookie(req);
    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("role" in decoded) ||
      !("id_user" in decoded) ||
      decoded.role !== "COACH"
    ) {
      return res
        .status(403)
        .json({ message: "Accès refusé : rôle COACH requis" });
    }

    const events = await prisma.evenement.findMany({
      where: { id_user: decoded.id_user },
      orderBy: { date_heure_debut: "asc" },
    });

    res.json(events);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

//  Récupérer un seul événement par ID
export async function getEventById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const event = await prisma.evenement.findUnique({
      where: { id_event: Number(id) },
      include: { coach: { select: { pseudo: true, email: true } } },
    });

    if (!event) {
      return res.status(404).json({ message: "Événement introuvable" });
    }

    res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
