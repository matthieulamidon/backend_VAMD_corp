import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 Récupérer tous les grands événements
export async function getGrandEvenements(req: Request, res: Response) {
  try {
    const events = await prisma.grandEvenement.findMany({
      orderBy: { date_heure_debut: "asc" },
    });
    return res.json(events);
  } catch (err) {
    console.error("getGrandEvenements error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// 🔹 Créer un grand événement
export async function createGrandEvent(req: Request, res: Response) {
  try {
    const {
      titre,
      type_event,
      date_heure_debut,
      date_heure_fin,
      lieu,
      description,
      org_logo,
      game_logo,
      prize,
    } = req.body;

    if (!titre || !type_event || !date_heure_debut || !date_heure_fin) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    const start = new Date(date_heure_debut);
    const end = new Date(date_heure_fin);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Format de date invalide" });
    }

    const event = await prisma.grandEvenement.create({
      data: {
        titre,
        type_event,
        date_heure_debut: start,
        date_heure_fin: end,
        lieu: lieu ?? null,
        description: description ?? null,
        org_logo: org_logo ?? null,
        game_logo: game_logo ?? null,
        prize: prize ?? null,
      },
    });

    return res.status(201).json(event);
  } catch (err) {
    console.error("createGrandEvent error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// 🔹 Mettre à jour un grand événement
export async function updateGrandEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      titre,
      type_event,
      date_heure_debut,
      date_heure_fin,
      lieu,
      description,
      org_logo,
      game_logo,
      prize,
    } = req.body;

    const existing = await prisma.grandEvenement.findUnique({
      where: { id: Number(id) },
    });

    if (!existing)
      return res.status(404).json({ message: "Événement introuvable" });

    const updated = await prisma.grandEvenement.update({
      where: { id: Number(id) },
      data: {
        titre: titre ?? existing.titre,
        type_event: type_event ?? existing.type_event,
        date_heure_debut: date_heure_debut
          ? new Date(date_heure_debut)
          : existing.date_heure_debut,
        date_heure_fin: date_heure_fin
          ? new Date(date_heure_fin)
          : existing.date_heure_fin,
        lieu: lieu ?? existing.lieu,
        description: description ?? existing.description,
        org_logo: org_logo ?? existing.org_logo,
        game_logo: game_logo ?? existing.game_logo,
        prize: prize ?? existing.prize,
      },
    });

    return res.json(updated);
  } catch (err) {
    console.error("updateGrandEvent error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

// 🔹 Supprimer un grand événement
export async function deleteGrandEvent(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const existing = await prisma.grandEvenement.findUnique({
      where: { id: Number(id) },
    });

    if (!existing)
      return res.status(404).json({ message: "Événement introuvable" });

    await prisma.grandEvenement.delete({ where: { id: Number(id) } });

    return res.json({ message: "Événement supprimé avec succès" });
  } catch (err) {
    console.error("deleteGrandEvent error:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}
