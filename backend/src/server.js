const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// rutas de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Importar rutas (las crearemos después)
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});