const Restaurant = require('../models/Restaurant');

// crea restaurante
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      cuisineType,
      priceRange,
      phone,
      email,
      imageUrl,
      operatingHours
    } = req.body;

    // validaciones
    if (!name || !address || !city || !cuisineType || !phone) {
      return res.status(400).json({
        error: 'Nombre, dirección, ciudad, tipo de cocina y teléfono son requeridos'
      });
    }

    // verifica que el usuario sea restaurant_owner
    if (req.user.role !== 'restaurant_owner') {
      return res.status(403).json({
        error: 'Solo los dueños de restaurantes pueden crear restaurantes'
      });
    }

    const restaurantData = {
      userId: req.user.id,
      name,
      description,
      address,
      city,
      state,
      cuisineType,
      priceRange,
      phone,
      email,
      imageUrl,
      operatingHours
    };

    const newRestaurant = await Restaurant.create(restaurantData);

    res.status(201).json({
      message: 'Restaurante creado exitosamente',
      restaurant: newRestaurant
    });

  } catch (error) {
    console.error('Error al crear restaurante:', error);
    res.status(500).json({
      error: 'Error al crear restaurante',
      details: error.message
    });
  }
};

// obtiene todos los restaurantes
const getAllRestaurants = async (req, res) => {
  try {
    const { city, cuisineType, priceRange, search } = req.query;

    const filters = {
      city,
      cuisineType,
      priceRange: priceRange ? parseInt(priceRange) : undefined,
      search
    };

    const restaurants = await Restaurant.findAll(filters);

    res.json({
      count: restaurants.length,
      restaurants
    });

  } catch (error) {
    console.error('Error al obtener restaurantes:', error);
    res.status(500).json({
      error: 'Error al obtener restaurantes',
      details: error.message
    });
  }
};

// obtiene restaurante por ID
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurante no encontrado'
      });
    }

    res.json({ restaurant });

  } catch (error) {
    console.error('Error al obtener restaurante:', error);
    res.status(500).json({
      error: 'Error al obtener restaurante',
      details: error.message
    });
  }
};

// obtiene restaurantes del usuario actual
const getMyRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findByUserId(req.user.id);

    res.json({
      count: restaurants.length,
      restaurants
    });

  } catch (error) {
    console.error('Error al obtener mis restaurantes:', error);
    res.status(500).json({
      error: 'Error al obtener restaurantes',
      details: error.message
    });
  }
};

// actualiza restaurante
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // verifica que el usuario sea el dueño
    const isOwner = await Restaurant.isOwner(id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para editar este restaurante'
      });
    }

    const updatedRestaurant = await Restaurant.update(id, req.body);

    if (!updatedRestaurant) {
      return res.status(404).json({
        error: 'Restaurante no encontrado'
      });
    }

    res.json({
      message: 'Restaurante actualizado exitosamente',
      restaurant: updatedRestaurant
    });

  } catch (error) {
    console.error('Error al actualizar restaurante:', error);
    res.status(500).json({
      error: 'Error al actualizar restaurante',
      details: error.message
    });
  }
};

// elimina restaurante
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // verifica que el usuario sea el dueño
    const isOwner = await Restaurant.isOwner(id, req.user.id);
    if (!isOwner) {
      return res.status(403).json({
        error: 'No tienes permiso para eliminar este restaurante'
      });
    }

    const deletedRestaurant = await Restaurant.delete(id);

    if (!deletedRestaurant) {
      return res.status(404).json({
        error: 'Restaurante no encontrado'
      });
    }

    res.json({
      message: 'Restaurante eliminado exitosamente',
      restaurant: deletedRestaurant
    });

  } catch (error) {
    console.error('Error al eliminar restaurante:', error);
    res.status(500).json({
      error: 'Error al eliminar restaurante',
      details: error.message
    });
  }
};

// exporta todas las funciones
module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  getMyRestaurants,
  updateRestaurant,
  deleteRestaurant
};