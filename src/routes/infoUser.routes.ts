import { Router } from "express";
import {
  infoUser,
  infoUserAndPerformance,
  updateUser,
} from "../controllers/infoUser.controller";
const router = Router();

router.get("/info", infoUser);
router.patch("/update", updateUser);
router.post("/infoUserAndPerformance", infoUserAndPerformance);

export default router;
