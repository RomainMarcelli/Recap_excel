import express from "express";
import { getCollaborators, addCollaborator, updateCollaborator, deleteCollaborator, addDaysWorked, updateCollaboratorComment } from "../controllers/collaboratorController";

const router = express.Router();

router.get("/", getCollaborators);
router.post("/", addCollaborator);
router.put("/:id", updateCollaborator);
router.delete("/:id", deleteCollaborator);
router.put("/:id/add-days", addDaysWorked);
router.put("/:id/comment", updateCollaboratorComment); // ✅ Nouvelle route API


export default router;
