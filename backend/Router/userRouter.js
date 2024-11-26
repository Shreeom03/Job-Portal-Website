import express from "express";
import {register,login, logout, getUser, updateProfile, updatePassword} from "../Controllers/userController.js";
import { isAuthenticated } from "../Middlewares/auth.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get('/logout',isAuthenticated,logout);

router.get('/profile', isAuthenticated, getUser);

router.put('/update/profile', isAuthenticated, updateProfile);

router.put('/update/password', isAuthenticated, updatePassword);

export default router;
