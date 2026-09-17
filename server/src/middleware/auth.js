import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from './error.js';
import { isDbReady } from '../config/db.js';

export function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set — copy server/.env.example to server/.env');
  return jwt.sign({ sub: String(user._id), role: user.role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new ApiError(401, 'Sign in to continue.');

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new ApiError(401, 'Your session expired. Please sign in again.');
    }

    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, 'That account no longer exists.');

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have access to this.'));
    }
    next();
  };
}

/** Guards routes that need MongoDB so they fail loudly instead of hanging. */
export function requireDb(req, res, next) {
  if (!isDbReady()) {
    return next(
      new ApiError(503, 'The database is unavailable. Check MONGODB_URI and that MongoDB is running.'),
    );
  }
  next();
}
