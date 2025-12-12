import { Router } from "express";
import {
  createEvent,
  getUserEvents,
  deleteEventById,
  updateEvent,
} from "../controllers/event.controller";

const router = Router();

// CREATE EVENT
router.post("/event", createEvent);

// GET EVENTS FOR THE CONNECTED USER
router.get("/event", getUserEvents);

// UPDATE EVENT
router.put("/event/:id", updateEvent);

// DELETE EVENT
router.delete("/event/:id", deleteEventById);

export default router;
