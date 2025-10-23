const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // obtiene token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Token no proporcionado' 
      });
    }

    const token = authHeader.substring(7);

    // verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // agrega informacion del usuario al request
    req.user = decoded;

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Token inválido' 
    });
  }
};

module.exports = authMiddleware;