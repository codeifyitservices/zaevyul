import express from 'express';
import rateLimit from 'express-rate-limit';
import { requireCustomerAuth } from '../middleware/customerAuth.js';
import {
  sendEmailOtp,
  verifyEmailOtp,
  sendPhoneOtp,
  verifyPhoneOtp,
  googleLogin,
  getMe,
  logout,
  updateCustomerProfile,
  updateCustomerMarketing,
  addCustomerAddress,
  deleteCustomerAddress,
  setDefaultCustomerAddress,
} from '../controllers/customerAuth.js';

const router = express.Router();

// Rate limiter for OTP send endpoints — max 5 requests per 15 minutes per IP
const otpSendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for OTP verify endpoints — max 10 attempts per 15 minutes per IP
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many verification attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for Google login — max 10 per 15 minutes per IP
const googleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email OTP
router.post('/email/send-otp', otpSendLimiter, sendEmailOtp);
router.post('/email/verify-otp', otpVerifyLimiter, verifyEmailOtp);

// Phone OTP
router.post('/phone/send-otp', otpSendLimiter, sendPhoneOtp);
router.post('/phone/verify-otp', otpVerifyLimiter, verifyPhoneOtp);

// Google Login
router.post('/google', googleLimiter, googleLogin);

// Session
router.get('/me', requireCustomerAuth, getMe);
router.post('/logout', logout);

// Profile and marketing preferences updates
router.put('/profile', requireCustomerAuth, updateCustomerProfile);
router.put('/marketing', requireCustomerAuth, updateCustomerMarketing);

// Address management
router.post('/address', requireCustomerAuth, addCustomerAddress);
router.delete('/address/:addressId', requireCustomerAuth, deleteCustomerAddress);
router.put('/address/:addressId/default', requireCustomerAuth, setDefaultCustomerAddress);

export default router;
