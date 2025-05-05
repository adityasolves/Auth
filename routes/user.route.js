import express from 'express'
import  {forgotPassword, getProfile, loginUser, logoutUser, registerUser, resetPassword, verifyUser } from '../controllers/user.controller.js'
import isLoggedIn from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register', registerUser)
router.get('/verify/:token', verifyUser)
router.post('/login', loginUser)
router.get('/get-profile', isLoggedIn, getProfile)
router.post('/logout', isLoggedIn, logoutUser)
router.post('/forgot', forgotPassword)
router.get('/reset/:token', resetPassword)

export default router