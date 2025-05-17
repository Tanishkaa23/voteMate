const express = require('express');
const router = express.Router()
const userController = require('../controllers/user.controller');
const { authMiddleware } = require('../middleware/auth.middleware'); 

// route will be /user/register .. 
router.post('/register',userController.userRegisterController)
router.post('/login',userController.loginUserController)
router.post('/logout',userController.logoutUserController)
router.get('/me', authMiddleware, userController.getMeController);

module.exports = router
