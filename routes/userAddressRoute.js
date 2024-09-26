import express from 'express';
import { createAddress } from '../controllers/addressController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Register User
router.post('/createAddress', verifyJWT, createAddress);

export default router;