const pool = require('../config/database');

class Table {
  static async create(tableData) {
    const { restaurantId, tableNumber, capacity } = tableData;

    const query = `
      INSERT INTO tables (restaurant_id, table_number, capacity)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [restaurantId, tableNumber, capacity]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Table.create:', error);
      throw error;
    }
  }

  static async findByRestaurantId(restaurantId) {
    const query = `
      SELECT * FROM tables 
      WHERE restaurant_id = $1 AND is_active = true
      ORDER BY table_number
    `;

    try {
      const result = await pool.query(query, [restaurantId]);
      return result.rows;
    } catch (error) {
      console.error('Error en Table.findByRestaurantId:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM tables WHERE id = $1';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Table.findById:', error);
      throw error;
    }
  }

  static async update(id, tableData) {
    const { tableNumber, capacity, isActive } = tableData;

    const query = `
      UPDATE tables
      SET
        table_number = COALESCE($1, table_number),
        capacity = COALESCE($2, capacity),
        is_active = COALESCE($3, is_active)
      WHERE id = $4
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [tableNumber, capacity, isActive, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Table.update:', error);
      throw error;
    }
  }

  static async delete(id) {
    const query = 'UPDATE tables SET is_active = false WHERE id = $1 RETURNING *';

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Table.delete:', error);
      throw error;
    }
  }

  static async hasFutureReservations(tableId) {
    const query = `
      SELECT COUNT(*) as count
      FROM reservations
      WHERE table_id = $1 
        AND reservation_date >= CURRENT_DATE
        AND status IN ('pending', 'confirmed')
    `;

    try {
      const result = await pool.query(query, [tableId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error en Table.hasFutureReservations:', error);
      throw error;
    }
  }
}

module.exports = {
    create: Table.create,
    findByRestaurantId: Table.findByRestaurantId,
    findById: Table.findById,
    update: Table.update,
    delete: Table.delete,
    hasFutureReservations: Table.hasFutureReservations, 
};
