const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

console.log('authController:', authController);
console.log('authMiddleware:', authMiddleware);
console.log('register type:', typeof authController?.register);

// rutas publicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// rutas protegidas - requieren autenticacion
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;