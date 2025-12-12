import { Router } from "express";
import {
  deleteUserByAdmin,
  infoAllUserForAdmin,
  updateUserByAdmin,
} from "../controllers/routesAdmin.controller";
import { register } from "../controllers/auth.controller";

const router = Router();

router.get("/infoAllUserForAdmin", infoAllUserForAdmin);
router.delete("/deleteUserByAdmin/:id_user", deleteUserByAdmin);
router.put("/updateUserByAdmin/:id_user", updateUserByAdmin);
router.post("/register", register);

export default router;
