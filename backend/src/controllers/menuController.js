const MenuItemModel = require('../models/MenuItemModelClass');
const Restaurant = require('../models/Restaurant');

console.log('--- DIAGNÓSTICO DE MODELO ---');
console.log('Tipo de MenuItemModel:', typeof MenuItemModel); 
console.log('Propiedades de MenuItemModel:', Object.getOwnPropertyNames(MenuItemModel)); 
console.log('--- FIN DIAGNÓSTICO ---');

// Crear item del menú
const createMenuItem = async (req, res) => {
  try {
    const { restaurantId, name, description, category, price, imageUrl } = req.body;

    // Validaciones
    if (!restaurantId || !name || !category || !price) {
      return res.status(400).json({
        error: 'ID de restaurante, nombre, categoría y precio son requeridos'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        error: 'El precio debe ser mayor a 0'
      });
    }

    // Verificar que el usuario sea dueño del restaurante
    const isOwner = await Restaurant.isOwner(restaurantId, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para agregar items al menú de este restaurante'
      });
    }

    const menuItemData = { restaurantId, name, description, category, price, imageUrl };
    const newMenuItem = await MenuItemModel.create(menuItemData);

    res.status(201).json({
      message: 'Item del menú creado exitosamente',
      menuItem: newMenuItem
    });

  } catch (error) {
    console.error('Error al crear item del menú:', error);
    res.status(500).json({
      error: 'Error al crear item del menú',
      details: error.message
    });
  }
};

// Obtener menú de un restaurante
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
    console.error('Error al obtener menú:', error);
    res.status(500).json({
      error: 'Error al obtener menú',
      details: error.message
    });
  }
};

// Obtener categorías del menú
const getMenuCategories = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const categories = await MenuItemModel.getCategories(restaurantId);

    res.json({
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      error: 'Error al obtener categorías',
      details: error.message
    });
  }
};

// Obtener item del menú por ID
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItemModel.findById(id);

    if (!menuItem) {
      return res.status(404).json({
        error: 'Item del menú no encontrado'
      });
    }

    res.json({ menuItem });

  } catch (error) {
    console.error('Error al obtener item del menú:', error);
    res.status(500).json({
      error: 'Error al obtener item del menú',
      details: error.message
    });
  }
};

// Actualizar item del menú
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el item para verificar el restaurante
    const menuItem = await MenuItemModel.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        error: 'Item del menú no encontrado'
      });
    }

    // Verificar que el usuario sea dueño del restaurante
    const isOwner = await Restaurant.isOwner(menuItem.restaurant_id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para editar este item del menú'
      });
    }

    const updatedMenuItem = await MenuItemModel.update(id, req.body);

    res.json({
      message: 'Item del menú actualizado exitosamente',
      menuItem: updatedMenuItem
    });

  } catch (error) {
    console.error('Error al actualizar item del menú:', error);
    res.status(500).json({
      error: 'Error al actualizar item del menú',
      details: error.message
    });
  }
};

// Eliminar item del menú
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener el item para verificar el restaurante
    const menuItem = await MenuItemModel.findById(id);
    if (!menuItem) {
      return res.status(404).json({
        error: 'Item del menú no encontrado'
      });
    }

    // Verificar que el usuario sea dueño del restaurante
    const isOwner = await Restaurant.isOwner(menuItem.restaurant_id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para eliminar este item del menú'
      });
    }

    const deletedMenuItem = await MenuItemModel.delete(id);

    res.json({
      message: 'Item del menú eliminado exitosamente',
      menuItem: deletedMenuItem
    });

  } catch (error) {
    console.error('Error al eliminar item del menú:', error);
    res.status(500).json({
      error: 'Error al eliminar item del menú',
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