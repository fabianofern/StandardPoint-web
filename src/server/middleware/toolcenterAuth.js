const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const db = require('../database/sqlite');

const client = jwksClient({
  jwksUri: process.env.TOOLCENTER_JWKS_URL || 'http://localhost:3000/.well-known/jwks.json'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

const syncUserToDb = (decodedPayload) => {
  try {
    const checkUser = db.prepare('SELECT * FROM users WHERE toolcenter_id = ?').get(decodedPayload.sub);
    const role = decodedPayload.roles && decodedPayload.roles.length > 0 ? decodedPayload.roles[0] : 'USER';
    
    if (!checkUser) {
      db.prepare('INSERT INTO users (id, toolcenter_id, email, name, role) VALUES (?, ?, ?, ?, ?)').run(
        `u_${Date.now()}`,
        decodedPayload.sub,
        decodedPayload.email,
        decodedPayload.name,
        role
      );
    } else {
      db.prepare('UPDATE users SET email = ?, name = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE toolcenter_id = ?').run(
        decodedPayload.email,
        decodedPayload.name,
        role,
        decodedPayload.sub
      );
    }
  } catch (error) {
    console.error('Erro de Sync do usuário no DB SQLite:', error);
  }
};

const toolcenterAuthMiddleware = (req, res, next) => {
  // Allow bypassing auth for local dev
  if (process.env.BYPASS_AUTH === 'true') {
    const devPayload = {
      sub: 'dev-user',
      email: 'dev@localhost',
      name: 'Developer Mode',
      roles: ['ADMINISTRATOR'],
      tools: [process.env.TOOL_SLUG || 'function-point']
    };
    
    syncUserToDb(devPayload);
    req.user = devPayload;
    return next();
  }

  const token = req.cookies.toolcenter_token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token', error: err.message });
    }

    // Check if user has access to this tool
    const tools = decoded.tools || [];
    const toolSlug = process.env.TOOL_SLUG || 'function-point';
    
    if (!tools.includes(toolSlug)) {
        return res.status(403).json({ message: 'Access denied for this tool' });
    }

    // Provision local db
    syncUserToDb(decoded);
    req.user = decoded;
    
    next();
  });
};

module.exports = toolcenterAuthMiddleware;
