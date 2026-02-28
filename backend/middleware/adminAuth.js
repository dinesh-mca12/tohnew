const unauthorized = (res) => {
  res.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
  return res.status(401).json({ message: 'Unauthorized admin access.' });
};

export const requireAdminAuth = (req, res, next) => {
  const configuredUsername = process.env.ADMIN_USERNAME || 'admin';
  const configuredPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Basic ')) {
    return unauthorized(res);
  }

  try {
    const base64Value = authHeader.slice(6);
    const decoded = Buffer.from(base64Value, 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator === -1) {
      return unauthorized(res);
    }
    const username = decoded.slice(0, separator);
    const password = decoded.slice(separator + 1);
    if (username !== configuredUsername || password !== configuredPassword) {
      return unauthorized(res);
    }
    req.adminUser = username;
    return next();
  } catch (error) {
    return unauthorized(res);
  }
};
