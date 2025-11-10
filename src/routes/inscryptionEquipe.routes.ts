import { Router } from "express";
import {
  completeProfile,
  getInfoUserForComplete,
  getTeamAndGame,
  inscryptionEquipe,
} from "../controllers/equipeInscryption.controller";

const router = Router();

router.get("/nameTeamAndGame", getTeamAndGame);
router.post("/inscryptionEquipe", inscryptionEquipe);
router.get("/infoUserForComplete", getInfoUserForComplete);
router.post("/completeProfile", completeProfile);

export default router;
