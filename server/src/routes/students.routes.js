import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Student from '../models/Student.js';
import { studentSchema, verifySchema, listQuerySchema } from '../schemas/index.js';
import { validate, pickSubmitted } from '../middleware/validate.js';
import { requireAuth, requireDb, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';

const router = Router();

// The lookup is public, so throttle it — a GR Number is a short numeric string
// and an unthrottled endpoint would be trivially enumerable.
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many verification attempts. Please try again shortly.' },
});

router.use(requireDb);

/**
 * Public GR Number verification. Returns only the five fields the privacy
 * policy permits, and answers 200 either way so the response shape stays
 * predictable for the UI.
 */
router.get('/verify', verifyLimiter, validate(verifySchema, 'query'), async (req, res) => {
  const student = await Student.findOne({
    grNumber: req.validatedQuery.gr,
    verifiable: true,
  });

  if (!student) {
    return res.json({
      found: false,
      message:
        'No verified student record was found for this GR Number. Please contact the office for assistance.',
    });
  }

  res.json({ found: true, student: student.toPublicJSON() });
});

router.use(requireAuth, requireRole('admin', 'editor'));

router.get('/', validate(listQuerySchema, 'query'), async (req, res) => {
  const { page, limit, q } = req.validatedQuery;

  const filter = {};
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ grNumber: rx }, { studentName: rx }, { fatherName: rx }, { program: rx }];
  }

  const [items, total] = await Promise.all([
    Student.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Student.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

router.post('/', validate(studentSchema), async (req, res) => {
  const student = await Student.create(req.body);
  res.status(201).json(student);
});

router.patch('/:id', validate(studentSchema.partial()), async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, pickSubmitted(req), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!student) throw new ApiError(404, 'Student record not found.');
  res.json(student);
});

router.delete('/:id', async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) throw new ApiError(404, 'Student record not found.');
  res.json({ ok: true });
});

export default router;
