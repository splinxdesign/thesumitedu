import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { loginSchema, registerSchema } from '../schemas/index.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireDb, signToken } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many sign-in attempts. Try again in 15 minutes.' },
});

router.use(requireDb);

/**
 * Bootstrap only: creates the very first admin. Once one exists this is closed,
 * so the endpoint can't be used to mint extra admins.
 */
router.post('/register', loginLimiter, validate(registerSchema), async (req, res) => {
  const existing = await User.estimatedDocumentCount();
  if (existing > 0) {
    throw new ApiError(403, 'An admin already exists. Ask them to create your account.');
  }
  const user = await User.create({ ...req.body, role: 'admin' });
  res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  // Same message either way so the response can't be used to enumerate accounts.
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Incorrect email or password.');
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.json({ token: signToken(user), user: user.toSafeJSON() });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

/** Lets the client hide the "create first admin" screen once setup is done. */
router.get('/status', async (req, res) => {
  const count = await User.estimatedDocumentCount();
  res.json({ needsSetup: count === 0 });
});

export default router;
