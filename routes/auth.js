import express from 'express';
import { login, logout } from '../controllers/authController.js';


const router = express.Router();

// User Login Route
router.post('/login', login);
router.post('/logout', logout);

export default router;