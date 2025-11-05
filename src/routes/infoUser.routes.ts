import { Router } from "express";
import { infoUser } from "../controllers/infoUser.controller";
const router = Router();

router.get("/info", infoUser);

export default router;
