import { Router } from "express";
import {
  acceptDemandeCoach,
  acceptDemandeJoueur,
  assignEquipeToUserByAdmin,
  CreateEquipe,
  DeleteEquipe,
  getAllDemandeEquipe,
  getAllDemandeForOneEquipe,
  getAllEquipe,
  refuseDemandeCoach,
  refuseDemandeJoueur,
  UpdateEquipe,
} from "../controllers/gestionEquipe.controller";

const router = Router();

router.post("/CreateEquipe", CreateEquipe);
router.get("/getAllEquipe", getAllEquipe);
router.delete("/DeleteEquipe", DeleteEquipe);
router.put("/UpdateEquipe", UpdateEquipe);
router.get("/getAllDemandeForOneEquipe", getAllDemandeForOneEquipe);
router.get("/getAllDemandeEquipe", getAllDemandeEquipe);
router.post("/acceptDemandeJoueur", acceptDemandeJoueur);
router.post("/acceptDemandeCoach", acceptDemandeCoach);
router.post("/refuseDemandeJoueur", refuseDemandeJoueur);
router.post("/refuseDemandeCoach", refuseDemandeCoach);
router.post("/assignEquipeToUserByAdmin", assignEquipeToUserByAdmin);

export default router;
