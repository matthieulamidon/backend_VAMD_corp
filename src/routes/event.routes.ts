import { Router } from "express";
import {
  createEvent,
  getUserEvents,
  deleteEventById,
  getPublicEvents,
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
// GET PUBLIC EVENTS (accessible à tous)
router.get("/public", getPublicEvents);

export default router;
