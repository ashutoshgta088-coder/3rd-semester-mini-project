const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'stuatten_secret_key_aktu_2026';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1] || authHeader;
  if (!token) {
    return res.status(401).json({ success: false, message: 'Malformed authorization header.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

const verifyRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Unauthorized. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
};

module.exports = {
  JWT_SECRET,
  verifyToken,
  verifyRole
};
