import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from './db.js';
import { loginSchema, validate } from './schemas.js';

const tokenOptions = { algorithm: 'HS256', issuer: 'cams-api', audience: 'cams-client' };
const secretIsConfigured = () => typeof process.env.JWT_SECRET === 'string' && process.env.JWT_SECRET.length >= 32;

export const login = [validate(loginSchema), async (request, response, next) => {
  try {
    if (!secretIsConfigured()) {
      return response.status(503).json({ error: 'Authentication is not configured' });
    }

    const { email, password } = request.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
      return response.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ role: user.role }, process.env.JWT_SECRET, {
      ...tokenOptions,
      subject: String(user.id),
      expiresIn: '1h',
    });
    response.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
}];

export async function requireProcurement(request, response, next) {
  const authorization = request.get('authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return response.status(401).json({ error: 'Bearer token required' });
  }
  if (!secretIsConfigured()) {
    return response.status(503).json({ error: 'Authentication is not configured' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: [tokenOptions.algorithm],
      issuer: tokenOptions.issuer,
      audience: tokenOptions.audience,
    });
    if (typeof payload !== 'object' || typeof payload.sub !== 'string' || !/^\d+$/.test(payload.sub)) {
      return response.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
    if (!user) return response.status(401).json({ error: 'Invalid or expired token' });
    if (user.role !== 'Procurement') return response.status(403).json({ error: 'Procurement role required' });

    request.authUser = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return response.status(401).json({ error: 'Invalid or expired token' });
    }
    next(error);
  }
}