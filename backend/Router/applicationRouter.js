import express from "express";
import {isAuthenticated , isAuthorized} from "../Middlewares/auth.js"
import { deleteApplication, employerGetAllApplication, jobSeekerGetAllApplication, postApplication } from "../Controllers/applicationController.js";

const router = express.Router();

router.post("/post/:id", isAuthenticated, isAuthorized("Job Seeker"), postApplication);

router.get("/employer/getAll", isAuthenticated, isAuthorized("Employer"), employerGetAllApplication);

router.get("/jobSeeker/getAll", isAuthenticated, isAuthorized("Job Seeker"), jobSeekerGetAllApplication);

router.delete("/delete/:id", isAuthenticated, deleteApplication);

export default router;