const express = require('express');
const router = express.Router();
const tableController = require('../controllers/tableController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/restaurant/:restaurantId', tableController.getTablesByRestaurant);
router.get('/:id', tableController.getTableById);
router.post('/', authMiddleware, tableController.createTable);
router.put('/:id', authMiddleware, tableController.updateTable);
router.delete('/:id', authMiddleware, tableController.deleteTable);

module.exports = router;