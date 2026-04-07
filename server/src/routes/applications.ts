import { Router } from "express";
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  updateOrder,
} from "../controllers/applicationController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get("/", getApplications);
router.post("/", createApplication);
router.put("/order", updateOrder);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

export default router;
