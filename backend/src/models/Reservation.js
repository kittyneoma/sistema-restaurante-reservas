const pool = require('../config/database');

class Reservation {
  // Crear una nueva reserva
  static async create(reservationData) {
    const {
      userId,
      restaurantId,
      tableId,
      reservationDate,
      reservationTime,
      partySize,
      specialRequests
    } = reservationData;

    const query = `
      INSERT INTO reservations (
        user_id, restaurant_id, table_id, reservation_date, 
        reservation_time, party_size, special_requests, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [
        userId, restaurantId, tableId, reservationDate,
        reservationTime, partySize, specialRequests
      ]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Reservation.create:', error);
      throw error;
    }
  }

  // Obtener reserva por ID
  static async findById(id) {
    const query = `
      SELECT r.*, 
        u.first_name, u.last_name, u.email, u.phone,
        rest.name as restaurant_name,
        t.table_number, t.capacity
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      JOIN restaurants rest ON r.restaurant_id = rest.id
      LEFT JOIN tables t ON r.table_id = t.id
      WHERE r.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Reservation.findById:', error);
      throw error;
    }
  }

  // Obtener reservas por usuario
  static async findByUserId(userId, filters = {}) {
    let query = `
      SELECT r.*, 
        rest.name as restaurant_name, rest.address, rest.city,
        t.table_number, t.capacity
      FROM reservations r
      JOIN restaurants rest ON r.restaurant_id = rest.id
      LEFT JOIN tables t ON r.table_id = t.id
      WHERE r.user_id = $1
    `;
    const params = [userId];
    let paramCount = 2;

    // Filtro por estado
    if (filters.status) {
      query += ` AND r.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    // Solo reservas futuras
    if (filters.upcoming) {
      query += ` AND (r.reservation_date > CURRENT_DATE OR 
                      (r.reservation_date = CURRENT_DATE AND r.reservation_time >= CURRENT_TIME))`;
    }

    // Solo reservas pasadas
    if (filters.past) {
      query += ` AND (r.reservation_date < CURRENT_DATE OR 
                      (r.reservation_date = CURRENT_DATE AND r.reservation_time < CURRENT_TIME))`;
    }

    query += ' ORDER BY r.reservation_date DESC, r.reservation_time DESC';

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error en Reservation.findByUserId:', error);
      throw error;
    }
  }

  // Obtener reservas por restaurante
  static async findByRestaurantId(restaurantId, filters = {}) {
    let query = `
      SELECT r.*, 
        u.first_name, u.last_name, u.email, u.phone,
        t.table_number, t.capacity
      FROM reservations r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN tables t ON r.table_id = t.id
      WHERE r.restaurant_id = $1
    `;
    const params = [restaurantId];
    let paramCount = 2;

    // Filtro por fecha
    if (filters.date) {
      query += ` AND r.reservation_date = $${paramCount}`;
      params.push(filters.date);
      paramCount++;
    }

    // Filtro por estado
    if (filters.status) {
      query += ` AND r.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    query += ' ORDER BY r.reservation_date ASC, r.reservation_time ASC';

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error en Reservation.findByRestaurantId:', error);
      throw error;
    }
  }

  // Actualizar estado de reserva
  static async updateStatus(id, status) {
    const query = `
      UPDATE reservations
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [status, id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Reservation.updateStatus:', error);
      throw error;
    }
  }

  // Cancelar reserva
  static async cancel(id) {
    const query = `
      UPDATE reservations
      SET status = 'cancelled', 
          cancelled_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en Reservation.cancel:', error);
      throw error;
    }
  }

  // Verificar disponibilidad de mesa en fecha/hora específica
  static async checkAvailability(tableId, date, time, excludeReservationId = null) {
    let query = `
      SELECT COUNT(*) as count
      FROM reservations
      WHERE table_id = $1 
        AND reservation_date = $2
        AND reservation_time = $3
        AND status IN ('pending', 'confirmed')
    `;
    const params = [tableId, date, time];

    // Excluir una reserva específica (útil para actualizaciones)
    if (excludeReservationId) {
      query += ` AND id != $4`;
      params.push(excludeReservationId);
    }

    try {
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count) === 0;
    } catch (error) {
      console.error('Error en Reservation.checkAvailability:', error);
      throw error;
    }
  }

  // Obtener mesas disponibles para fecha/hora/tamaño de grupo
  static async getAvailableTables(restaurantId, date, time, partySize) {
    const query = `
      SELECT t.*
      FROM tables t
      WHERE t.restaurant_id = $1
        AND t.is_active = true
        AND t.capacity >= $4
        AND t.id NOT IN (
          SELECT r.table_id
          FROM reservations r
          WHERE r.table_id = t.id
            AND r.reservation_date = $2
            AND r.reservation_time = $3
            AND r.status IN ('pending', 'confirmed')
        )
      ORDER BY t.capacity ASC
    `;

    try {
      const result = await pool.query(query, [restaurantId, date, time, partySize]);
      return result.rows;
    } catch (error) {
      console.error('Error en Reservation.getAvailableTables:', error);
      throw error;
    }
  }

  // Verificar si se puede cancelar (mínimo 2 horas antes)
  static async canBeCancelled(id) {
    const query = `
      SELECT reservation_date, reservation_time
      FROM reservations
      WHERE id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      if (!result.rows[0]) return false;

      const { reservation_date, reservation_time } = result.rows[0];
      const reservationDateTime = new Date(`${reservation_date} ${reservation_time}`);
      const now = new Date();
      const hoursDifference = (reservationDateTime - now) / (1000 * 60 * 60);

      return hoursDifference >= 2;
    } catch (error) {
      console.error('Error en Reservation.canBeCancelled:', error);
      throw error;
    }
  }
}

module.exports = Reservation;