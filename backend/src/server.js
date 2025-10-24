const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// importa configuracion de BD
require('./config/database');

// prueba de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// importa rutas
const authRoutes = require('./routes/authRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const tableRoutes = require('./routes/tableRoutes');
const menuRoutes = require('./routes/menuRoutes');

// usa rutas
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/menu', menuRoutes); 

// puerto
const PORT = process.env.PORT || 5000;

// inicia servidor
app.listen(PORT, () => {
  console.log(`\nServer running on http://localhost:${PORT}`);
  console.log(`\nAPI Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/profile\n`);
  console.log('\n Restaurants:');
  console.log(`   GET    /api/restaurants - Listar todos`);
  console.log(`   GET    /api/restaurants/:id - Obtener uno`);
  console.log(`   POST   /api/restaurants - Crear (auth)`);
  console.log(`   GET    /api/restaurants/my/restaurants - Mis restaurantes (auth)`);
  console.log(`   PUT    /api/restaurants/:id - Actualizar (auth)`);
  console.log(`   DELETE /api/restaurants/:id - Eliminar (auth)\n`);
  console.log(`\n Tables:`);
  console.log(`   GET    /api/tables/restaurant/:restaurantId`);
  console.log(`   POST   /api/tables (auth)`);
  console.log(`   PUT    /api/tables/:id (auth)`);
  console.log(`   DELETE /api/tables/:id (auth)`);
  console.log(`\n Menu:`);
  console.log(`   GET    /api/menu/restaurant/:restaurantId`);
  console.log(`   GET    /api/menu/restaurant/:restaurantId/categories`);
  console.log(`   POST   /api/menu (auth)`);
  console.log(`   PUT    /api/menu/:id (auth)`);
  console.log(`   DELETE /api/menu/:id (auth)\n`);
});

module.exports = app;