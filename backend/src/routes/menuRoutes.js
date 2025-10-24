const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas públicas
router.get('/restaurant/:restaurantId', menuController.getMenuByRestaurant);
router.get('/restaurant/:restaurantId/categories', menuController.getMenuCategories);
router.get('/:id', menuController.getMenuItemById);

// Rutas protegidas (requieren autenticación)
router.post('/', authMiddleware, menuController.createMenuItem);
router.put('/:id', authMiddleware, menuController.updateMenuItem);
router.delete('/:id', authMiddleware, menuController.deleteMenuItem);

module.exports = router;