import { Router } from "express";
import { infoAllUserForAdmin } from "../controllers/routesAdmin.controller";

const router = Router();

router.get("/infoAllUserForAdmin", infoAllUserForAdmin);

export default router;
