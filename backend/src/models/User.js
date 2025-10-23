const pool = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // crea un nuevo usuario
  static async create(userData) {
    const { email, password, firstName, lastName, phone, role = 'customer' } = userData;
    
    // hash del password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, first_name, last_name, phone, role, created_at
    `;

    try {
      const result = await pool.query(query, [email, passwordHash, firstName, lastName, phone, role]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // busca usuario por email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    
    try {
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // busca usuario por ID
  static async findById(id) {
    const query = 'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1';
    
    try {
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // verifica contrase
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;