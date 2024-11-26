import express from "express";
import { postJob, getAllJobs, getMyJobs, deleteJob, getAJob} from "../Controllers/jobController.js";
import { isAuthenticated, isAuthorized } from "../Middlewares/auth.js";

const router = express.Router();

router.post("/post", isAuthenticated, isAuthorized("Employer"), postJob);
router.get("/getAll", getAllJobs);
router.get("/getMyJobs", isAuthenticated, isAuthorized("Employer"), getMyJobs);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Employer"), deleteJob);
router.get("/get/:id", isAuthenticated, getAJob);

export default router;