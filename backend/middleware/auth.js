const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  // Basic auth format: "Basic base64(username:password)"
  const base64Credentials = authHeader.split(' ')[1];
  if (!base64Credentials) {
    return res.status(401).json({ error: 'Invalid authorization format' });
  }

  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (password === ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

module.exports = { adminAuth };

