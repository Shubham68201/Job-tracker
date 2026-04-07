import { Router } from "express";
import { parseJD, getSuggestions } from "../controllers/aiController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.post("/parse", parseJD);
router.post("/suggestions", getSuggestions);

export default router;
