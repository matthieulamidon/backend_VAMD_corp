import { Router } from "express";
// eslint-disable-next-line prettier/prettier
import {
  createEvent,
  getEvents,
  getCoachEvents,
  getEventById,
} from "../controllers/event.controller";
import { verifyAuthCookie } from "../utils/jwt";

const router = Router();

// Récupérer tous les événements pour le calendrier
router.get("/events", getEvents);

// Récupérer les événements du coach connecté
router.get("/events/me", verifyAuthCookie, getCoachEvents);

// Récupérer un événement précis par son ID
router.get("/events/:id", getEventById);

//  Créer un événement (réservé aux coachs)
// Pour test rapide

router.post("/events", createEvent);

export default router;
