const pool = require('../config/database');

class Restaurant {
  static async create(restaurantData) {
    const {
      userId,
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
    } = restaurantData;

    const query = `
      INSERT INTO restaurants (
        user_id, name, description, address, city, state,
        cuisine_type, price_range, phone, email, image_url, operating_hours
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        userId, name, description, address, city, state,
        cuisineType, priceRange, phone, email, imageUrl,
        JSON.stringify(operatingHours || {})
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Restaurant.create:', error);
      throw error;
    }
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM restaurants WHERE is_active = true';
    const params = [];
    let paramCount = 1;

    if (filters.city) {
      query += ` AND LOWER(city) = LOWER($${paramCount})`;
      params.push(filters.city);
      paramCount++;
    }

    if (filters.cuisineType) {
      query += ` AND LOWER(cuisine_type) = LOWER($${paramCount})`;
      params.push(filters.cuisineType);
      paramCount++;
    }

    if (filters.priceRange) {
      query += ` AND price_range = $${paramCount}`;
      params.push(filters.priceRange);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND LOWER(name) LIKE LOWER($${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error en Restaurant.findAll:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM restaurants WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Restaurant.findById:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    const query = 'SELECT * FROM restaurants WHERE user_id = $1 ORDER BY created_at DESC';
    
    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error en Restaurant.findByUserId:', error);
      throw error;
    }
  }

  static async update(id, restaurantData) {
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
      operatingHours,
      isActive
    } = restaurantData;

    const query = `
      UPDATE restaurants
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        address = COALESCE($3, address),
        city = COALESCE($4, city),
        state = COALESCE($5, state),
        cuisine_type = COALESCE($6, cuisine_type),
        price_range = COALESCE($7, price_range),
        phone = COALESCE($8, phone),
        email = COALESCE($9, email),
        image_url = COALESCE($10, image_url),
        operating_hours = COALESCE($11, operating_hours),
        is_active = COALESCE($12, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        name, description, address, city, state, cuisineType,
        priceRange, phone, email, imageUrl, 
        operatingHours ? JSON.stringify(operatingHours) : null,
        isActive, id
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Restaurant.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    const query = 'UPDATE restaurants SET is_active = false WHERE id = $1 RETURNING *';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Restaurant.delete:', error);
      throw error;
    }
  }

  static async isOwner(restaurantId, userId) {
    const query = 'SELECT user_id FROM restaurants WHERE id = $1';
    
    try {
      const result = await pool.query(query, [restaurantId]);
      if (!result.rows[0]) return false;
      return result.rows[0].user_id === userId;
    } catch (error) {
      console.error('Error en Restaurant.isOwner:', error);
      throw error;
    }
  }
}

module.exports = Restaurant;