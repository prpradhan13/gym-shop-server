import express from 'express';
import { deleteUser, forgotPasswordController, getAllUser, loginController, logout, refreshAccessToken, registerController } from '../controllers/userController.js';
import { isAdmin, verifyJWT } from '../middlewares/authMiddleware.js';


const router = express.Router();

// Register User
router.post('/register', registerController);

// Login User
router.post('/login', loginController);

// Forgot Password
router.post('/forgotPassword', forgotPasswordController);

// Logout User
router.post('/logout', verifyJWT, logout);

// Regenerate token if time expired
router.post('/refresh-token', refreshAccessToken);

// User only access
router.get('/user-auth', verifyJWT, (req, res) => res.status(200).send({ ok: true }));

// Admin only access
router.get('/admin-auth', verifyJWT, isAdmin, (req, res) => res.status(200).send({ admin: true }));

// Delete User
router.delete('/deleteUser/:id', verifyJWT, isAdmin, deleteUser);

// Get all Users
router.get('/allUser', getAllUser);

// Update address route
// router.put('/userAddress/:userId', updateUserAddress);

export default router;