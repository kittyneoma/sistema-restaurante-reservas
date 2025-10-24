const pool = require('../config/database');

class MenuItem {
  // Crear un item del menú
  static async create(menuItemData) {
    const { restaurantId, name, description, category, price, imageUrl } = menuItemData;

    const query = `
      INSERT INTO menu_items (restaurant_id, name, description, category, price, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        restaurantId, name, description, category, price, imageUrl
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en MenuItem.create:', error);
      throw error;
    }
  }

  // Obtener items del menú por restaurante
  static async findByRestaurantId(restaurantId, filters = {}) {
    let query = `
      SELECT * FROM menu_items 
      WHERE restaurant_id = $1 AND is_available = true
    `;
    const params = [restaurantId];
    let paramCount = 2;

    // Filtro por categoría
    if (filters.category) {
      query += ` AND LOWER(category) = LOWER($${paramCount})`;
      params.push(filters.category);
      paramCount++;
    }

    query += ' ORDER BY category, name';

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error en MenuItem.findByRestaurantId:', error);
      throw error;
    }
  }

  // Obtener item por ID
  static async findById(id) {
    const query = 'SELECT * FROM menu_items WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en MenuItem.findById:', error);
      throw error;
    }
  }

  // Actualizar item del menú
  static async update(id, menuItemData) {
    const { name, description, category, price, imageUrl, isAvailable } = menuItemData;

    const query = `
      UPDATE menu_items
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category = COALESCE($3, category),
        price = COALESCE($4, price),
        image_url = COALESCE($5, image_url),
        is_available = COALESCE($6, is_available),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        name, description, category, price, imageUrl, isAvailable, id
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en MenuItem.update:', error);
      throw error;
    }
  }

  // Eliminar item del menú (soft delete)
  static async delete(id) {
    const query = 'UPDATE menu_items SET is_available = false WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en MenuItem.delete:', error);
      throw error;
    }
  }

  // Obtener categorías de un restaurante
  static async getCategories(restaurantId) {
    const query = `
      SELECT DISTINCT category 
      FROM menu_items 
      WHERE restaurant_id = $1 AND is_available = true
      ORDER BY category
    `;

    try {
      const result = await pool.query(query, [restaurantId]);
      return result.rows.map(row => row.category);
    } catch (error) {
      console.error('Error en MenuItem.getCategories:', error);
      throw error;
    }
  }
}

module.exports = {
    create: MenuItem.create,
    findByRestaurantId: MenuItem.findByRestaurantId,
    findById: MenuItem.findById,
    update: MenuItem.update,
    delete: MenuItem.delete,
    getCategories: MenuItem.getCategories,
};