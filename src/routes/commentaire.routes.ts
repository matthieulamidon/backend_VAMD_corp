import { Router } from "express";
import {
  addCommentaire,
  getCommentairesAll,
  getCommentairesByPlayer,
} from "../controllers/commentaire.controller";

const router = Router();

// Ajouter un commentaire (COACH uniquement)
router.post("/commentaires", addCommentaire);

// Récupérer tous les commentaires (COACH uniquement)
router.get("/commentaires", getCommentairesAll);

// Récupérer les commentaires d’un joueur spécifique
router.get("/commentaires/joueur/:id_joueur", getCommentairesByPlayer);

export default router;
