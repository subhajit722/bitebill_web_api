import express from 'express';
import { register, verifyOTPAndRegister, login, forgotPassword, resetPassword, logout } from '../Contex/AdminContex.js';

const router = express.Router();

// Route for user registration
router.post('/register', register);

// Route for verifying OTP and completing registration
router.post('/verify-otp', verifyOTPAndRegister);

// Route for user login
router.post('/login', login);

// Route for initiating forgot password process
router.post('/forgot-password', forgotPassword);

// Route for resetting password using reset token
router.post('/reset-password', resetPassword);

// Route for user logout
router.post('/logout', logout);

export default router;
