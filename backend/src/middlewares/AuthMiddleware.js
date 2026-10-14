
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    // Obtém o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Token de autenticação não informado.',
      });
    }

    // Formato esperado: Bearer <token>
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({
        message: 'Formato do token inválido.',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido ou expirado.',
    });
  }
}

module.exports = authMiddleware;

