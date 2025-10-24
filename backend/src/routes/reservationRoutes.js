const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const authMiddleware = require('../middlewares/authMiddleware');

// ruta publica
router.get('/availability/:restaurantId', reservationController.getAvailability);

// rutas protegidas
router.get('/my/reservations', authMiddleware, reservationController.getMyReservations);
router.get('/restaurant/:restaurantId', authMiddleware, reservationController.getRestaurantReservations);

router.post('/', authMiddleware, reservationController.createReservation);

router.get('/:id', authMiddleware, reservationController.getReservationById);
router.put('/:id/status', authMiddleware, reservationController.updateReservationStatus);
router.put('/:id/cancel', authMiddleware, reservationController.cancelReservation);

module.exports = router;
