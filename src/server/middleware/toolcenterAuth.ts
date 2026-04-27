import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import db from '../database/sqlite';
import { Request, Response, NextFunction } from 'express';

// Extend Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const client = jwksClient({
  jwksUri: process.env.TOOLCENTER_JWKS_URL || 'http://localhost:3000/.well-known/jwks.json'
});

function getKey(header: JwtHeader, callback: SigningKeyCallback) {
  client.getSigningKey(header.kid, function(err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

const syncUserToDb = (decodedPayload: any) => {
  try {
    const checkUser = db.prepare('SELECT * FROM users WHERE toolcenter_id = ?').get(decodedPayload.sub) as any;
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

const toolcenterAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
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

  jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded: any) => {
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

export default toolcenterAuthMiddleware;
