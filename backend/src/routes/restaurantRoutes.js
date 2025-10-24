const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authMiddleware = require('../middlewares/authMiddleware');

// rutas publicas
router.get('/', restaurantController.getAllRestaurants);

// rutas protegidas
router.get('/my/restaurants', authMiddleware, restaurantController.getMyRestaurants);

router.post('/', authMiddleware, restaurantController.createRestaurant);

// rutas con parametros
router.get('/:id', restaurantController.getRestaurantById);
router.put('/:id', authMiddleware, restaurantController.updateRestaurant);
router.delete('/:id', authMiddleware, restaurantController.deleteRestaurant);

module.exports = router;