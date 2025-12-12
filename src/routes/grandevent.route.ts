import { Router } from "express";
import {
  getGrandEvenements,
  createGrandEvent,
  updateGrandEvent,
  deleteGrandEvent,
} from "../controllers/grandevent.controller";

const router = Router();

// GET ALL GRAND EVENTS
router.get("/grandevent", getGrandEvenements);

// CREATE GRAND EVENT
router.post("/grandevent", createGrandEvent);

// UPDATE GRAND EVENT
router.put("/grandevent/:id", updateGrandEvent);

// DELETE GRAND EVENT
router.delete("/grandevent/:id", deleteGrandEvent);

export default router;
