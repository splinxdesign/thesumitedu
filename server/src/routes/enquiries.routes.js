import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import Enquiry from '../models/Enquiry.js';
import {
  enquiryCreateSchema,
  contactCreateSchema,
  enquiryUpdateSchema,
  listQuerySchema,
} from '../schemas/index.js';
import { validate, pickSubmitted } from '../middleware/validate.js';
import { requireAuth, requireDb, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'You have sent several enquiries already. Please contact us on WhatsApp.' },
});

router.use(requireDb);

const SUCCESS = {
  ok: true,
  message:
    'Our admissions team will contact you soon. For faster answers, you can also reach us directly on WhatsApp.',
};

/** Public: the Get Enrolled admission enquiry form. */
router.post('/', submitLimiter, validate(enquiryCreateSchema), async (req, res) => {
  const { website, ...payload } = req.body;
  if (website) return res.status(201).json(SUCCESS); // honeypot — accept silently

  await Enquiry.create({ ...payload, userAgent: req.get('user-agent') ?? '' });
  res.status(201).json(SUCCESS);
});

/** Public: the shorter Campuses & Contact message form. */
router.post('/contact', submitLimiter, validate(contactCreateSchema), async (req, res) => {
  const { website, ...payload } = req.body;
  if (website) return res.status(201).json(SUCCESS);

  await Enquiry.create({
    ...payload,
    source: 'contact',
    userAgent: req.get('user-agent') ?? '',
  });
  res.status(201).json(SUCCESS);
});

router.use(requireAuth, requireRole('admin', 'editor'));

router.get('/', validate(listQuerySchema, 'query'), async (req, res) => {
  const { page, limit, status, source, q } = req.validatedQuery;

  const filter = {};
  if (status) filter.status = status;
  if (source) filter.source = source;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { phone: rx }, { course: rx }, { message: rx }];
  }

  // Counts for the status pills and source tabs both respect the *other*
  // filter and the search term, but never their own dimension — so switching
  // tabs never has to wait on a second round trip to know the right numbers.
  const sourceFilter = { ...filter };
  delete sourceFilter.source;
  const statusFilter = { ...filter };
  delete statusFilter.status;

  const [items, total, statusCounts, sourceCounts] = await Promise.all([
    Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Enquiry.countDocuments(filter),
    Enquiry.aggregate([{ $match: statusFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Enquiry.aggregate([{ $match: sourceFilter }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
  ]);

  res.json({
    items,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    counts: Object.fromEntries(statusCounts.map((row) => [row._id, row.count])),
    sourceCounts: Object.fromEntries(sourceCounts.map((row) => [row._id, row.count])),
  });
});

router.patch('/:id', validate(enquiryUpdateSchema), async (req, res) => {
  const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, pickSubmitted(req), {
    returnDocument: 'after',
    runValidators: true,
  });
  if (!enquiry) throw new ApiError(404, 'Enquiry not found.');
  res.json(enquiry);
});

router.delete('/:id', async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) throw new ApiError(404, 'Enquiry not found.');
  res.json({ ok: true });
});

export default router;
