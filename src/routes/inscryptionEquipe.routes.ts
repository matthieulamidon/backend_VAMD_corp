import { Router } from "express";
import {
  completeProfile,
  getInfoUserForComplete,
  getTeamAndGame,
  inscryptionEquipe,
  inscriptionCoach,
} from "../controllers/equipeInscryption.controller";

const router = Router();

router.get("/nameTeamAndGame", getTeamAndGame);
router.post("/inscryptionEquipe", inscryptionEquipe);
router.get("/infoUserForComplete", getInfoUserForComplete);
router.post("/completeProfile", completeProfile);
router.post("/inscriptionCoach", inscriptionCoach);

export default router;
