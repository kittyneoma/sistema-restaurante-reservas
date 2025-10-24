const MenuItemModel = require('../models/MenuItemModelClass');
const Restaurant = require('../models/Restaurant');

const createMenuItem = async (req, res) => {
  try {
    const { restaurantId, name, description, category, price, imageUrl } = req.body;

    if (!restaurantId || !name || !category || !price) {
      return res.status(400).json({
        error: 'ID de restaurante, nombre, categoria y precio son requeridos'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        error: 'El precio debe ser mayor a 0'
      });
    }

    const isOwner = await Restaurant.isOwner(restaurantId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para agregar items al menu de este restaurante'
      });
    }

    const menuItemData = { restaurantId, name, description, category, price, imageUrl };
    const newMenuItem = await MenuItemModel.create(menuItemData);

    res.status(201).json({
      message: 'Item del menu creado exitosamente',
      menuItem: newMenuItem
    });

  } catch (error) {
    console.error('Error al crear item del menúu:', error);
    res.status(500).json({
      error: 'Error al crear item del menu',
      details: error.message
    });
  }
};

const getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category } = req.query;

    const filters = { category };
    const menuItems = await MenuItemModel.findByRestaurantId(restaurantId, filters);

    res.json({
      count: menuItems.length,
      menuItems
    });

  } catch (error) {
    console.error('Error al obtener menu:', error);
    res.status(500).json({
      error: 'Error al obtener menu',
      details: error.message
    });
  }
};

const getMenuCategories = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const categories = await MenuItemModel.getCategories(restaurantId);

    res.json({
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error('Error al obtener categorias:', error);
    res.status(500).json({
      error: 'Error al obtener categorias',
      details: error.message
    });
  }
};

const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItemModel.findById(id);

    if (!menuItem) {
      return res.status(404).json({
        error: 'Item del menu no encontrado'
      });
    }

    res.json({ menuItem });

  } catch (error) {
    console.error('Error al obtener item del menu:', error);
    res.status(500).json({
      error: 'Error al obtener item del menu',
      details: error.message
    });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItemModel.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        error: 'Item del menu no encontrado'
      });
    }

    const isOwner = await Restaurant.isOwner(menuItem.restaurant_id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para editar este item del menu'
      });
    }

    const updatedMenuItem = await MenuItemModel.update(id, req.body);

    res.json({
      message: 'Item del menu actualizado exitosamente',
      menuItem: updatedMenuItem
    });

  } catch (error) {
    console.error('Error al actualizar item del menu:', error);
    res.status(500).json({
      error: 'Error al actualizar item del menu',
      details: error.message
    });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItemModel.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        error: 'Item del menu no encontrado'
      });
    }

    const isOwner = await Restaurant.isOwner(menuItem.restaurant_id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para eliminar este item del menu'
      });
    }

    const deletedMenuItem = await MenuItemModel.delete(id);

    res.json({
      message: 'Item del menu eliminado exitosamente',
      menuItem: deletedMenuItem
    });

  } catch (error) {
    console.error('Error al eliminar item del menu:', error);
    res.status(500).json({
      error: 'Error al eliminar item del menu',
      details: error.message
    });
  }
};

module.exports = {
  createMenuItem,
  getMenuByRestaurant,
  getMenuCategories,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem
};
