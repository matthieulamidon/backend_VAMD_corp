import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { verifyAuthCookie } from "../utils/jwt";

const prisma = new PrismaClient();

// ------------------- Ajouter un commentaire -------------------
export async function addCommentaire(req: Request, res: Response) {
  try {
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
    if (decoded.role !== 1) {
      return res
        .status(403)
        .json({ message: "Accès refusé : rôle COACH requis" });
    }

    const id_coach = decoded.userId;
    const { id_joueur, id_event, kds } = req.body;

    if (!id_joueur || !kds) {
      return res.status(400).json({ message: "Champs manquants" });
    }

    const commentaire = await prisma.commentaire.create({
      data: {
        id_coach,
        id_joueur,
        id_event: id_event ?? null,
        kds,
      },
    });

    return res.status(201).json(commentaire);
  } catch (err) {
    console.error("addCommentaire error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// ------------------- Récupérer tous les commentaires -------------------
export async function getCommentairesAll(req: Request, res: Response) {
  try {
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
    if (decoded.role !== 1) {
      return res
        .status(403)
        .json({ message: "Accès refusé : rôle COACH requis" });
    }

    const commentaires = await prisma.commentaire.findMany({
      include: {
        coach: { select: { pseudo: true } },
        joueur: { select: { pseudo: true } },
        event: { select: { titre_event: true } },
      },
      orderBy: { date_commentaire: "desc" },
    });

    return res.json(commentaires);
  } catch (err) {
    console.error("getCommentairesAll error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// ------------------- Récupérer commentaires d’un joueur -------------------
export async function getCommentairesByPlayer(req: Request, res: Response) {
  try {
    const decoded = verifyAuthCookie(req);

    if (!decoded) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    const id_joueur = Number(req.params.id_joueur);

    const commentaires = await prisma.commentaire.findMany({
      where: { id_joueur },
      include: {
        coach: { select: { pseudo: true } },
        event: { select: { titre_event: true } },
      },
      orderBy: { date_commentaire: "desc" },
    });

    return res.json(commentaires);
  } catch (err) {
    console.error("getCommentairesByPlayer error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
