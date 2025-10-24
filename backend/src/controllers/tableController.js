const TableModel = require('../models/TableModelClass');
const Restaurant = require('../models/Restaurant');

// crea mesa
const createTable = async (req, res) => {
  try {
    const { restaurantId, tableNumber, capacity } = req.body;

    if (!restaurantId || !tableNumber || !capacity) {
      return res.status(400).json({
        error: 'ID de restaurante, número de mesa y capacidad son requeridos'
      });
    }

    if (capacity < 1 || capacity > 12) {
      return res.status(400).json({
        error: 'La capacidad debe estar entre 1 y 12 personas'
      });
    }

    // verifica que el usuario sea dueño del restaurante
    const isOwner = await Restaurant.isOwner(restaurantId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para agregar mesas a este restaurante'
      });
    }

    const tableData = { restaurantId, tableNumber, capacity };
    const newTable = await TableModel.create(tableData);

    res.status(201).json({
      message: 'Mesa creada exitosamente',
      table: newTable
    });

  } catch (error) {
    console.error('Error al crear mesa:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Ya existe una mesa con ese número en este restaurante'
      });
    }

    res.status(500).json({
      error: 'Error al crear mesa',
      details: error.message
    });
  }
};

// obtiene mesas de un restaurante
const getTablesByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const tables = await TableModel.findByRestaurantId(restaurantId);

    res.json({
      count: tables.length,
      tables
    });

  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({
      error: 'Error al obtener mesas',
      details: error.message
    });
  }
};

// obtiene mesa por ID
const getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await TableModel.findById(id);

    if (!table) {
      return res.status(404).json({
        error: 'Mesa no encontrada'
      });
    }

    res.json({ table });

  } catch (error) {
    console.error('Error al obtener mesa:', error);
    res.status(500).json({
      error: 'Error al obtener mesa',
      details: error.message
    });
  }
};

// actualiza mesa
const updateTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await TableModel.findById(id);
    if (!table) {
      return res.status(404).json({
        error: 'Mesa no encontrada'
      });
    }

    const isOwner = await Restaurant.isOwner(table.restaurant_id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para editar esta mesa'
      });
    }

    const updatedTable = await TableModel.update(id, req.body);

    res.json({
      message: 'Mesa actualizada exitosamente',
      table: updatedTable
    });

  } catch (error) {
    console.error('Error al actualizar mesa:', error);
    res.status(500).json({
      error: 'Error al actualizar mesa',
      details: error.message
    });
  }
};

const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await TableModel.findById(id);
    if (!table) {
      return res.status(404).json({
        error: 'Mesa no encontrada'
      });
    }

    const isOwner = await Restaurant.isOwner(table.restaurant_id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para eliminar esta mesa'
      });
    }

    const hasFutureReservations = await TableModel.hasFutureReservations(id);
    if (hasFutureReservations) {
      return res.status(400).json({
        error: 'No se puede eliminar una mesa con reservas futuras'
      });
    }

    const deletedTable = await TableModel.delete(id);

    res.json({
      message: 'Mesa eliminada exitosamente',
      table: deletedTable
    });

  } catch (error) {
    console.error('Error al eliminar mesa:', error);
    res.status(500).json({
      error: 'Error al eliminar mesa',
      details: error.message
    });
  }
};

module.exports = {
  createTable,
  getTablesByRestaurant,
  getTableById,
  updateTable,
  deleteTable
};