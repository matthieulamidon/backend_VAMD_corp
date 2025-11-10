import { Router } from "express";
import { infoUser, updateUser } from "../controllers/infoUser.controller";
const router = Router();

router.get("/info", infoUser);
router.patch("/update", updateUser);

export default router;
