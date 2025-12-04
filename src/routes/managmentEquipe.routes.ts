import { Router } from "express";
import {
  getAllEquipeOfPlayer,
  getJoueurEquipePosition,
  updateEquipePositions,
} from "../controllers/managmentEquipe.controller";

const router = Router();

// Récupérer tous les événements pour le calendrier
router.get("/getAllEquipeOfPlayer", getAllEquipeOfPlayer);
router.post("/getJoueurEquipePosition", getJoueurEquipePosition);
router.put("/updateEquipePositions", updateEquipePositions);

export default router;
