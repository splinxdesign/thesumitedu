import { Router } from 'express';
import authRoutes from './auth.routes.js';
import enquiryRoutes from './enquiries.routes.js';
import studentRoutes from './students.routes.js';
import { createContentRouter } from './content.routes.js';
import Program from '../models/Program.js';
import Article from '../models/Article.js';
import Achiever from '../models/Achiever.js';
import MeritYear from '../models/MeritYear.js';
import GalleryEvent from '../models/GalleryEvent.js';
import Enquiry from '../models/Enquiry.js';
import Student from '../models/Student.js';
import {
  programSchema,
  articleSchema,
  achieverSchema,
  meritYearSchema,
  galleryEventSchema,
} from '../schemas/index.js';
import { requireAuth, requireDb, requireRole } from '../middleware/auth.js';
import { isDbReady } from '../config/db.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, db: isDbReady() ? 'connected' : 'disconnected', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/students', studentRoutes);

router.use('/programs', createContentRouter({ model: Program, schema: programSchema }));
router.use('/articles', createContentRouter({ model: Article, schema: articleSchema }));
router.use(
  '/achievers',
  createContentRouter({ model: Achiever, schema: achieverSchema, sort: { group: 1, order: 1 } }),
);
router.use(
  '/merit-years',
  createContentRouter({ model: MeritYear, schema: meritYearSchema, sort: { year: -1 } }),
);
router.use(
  '/gallery',
  createContentRouter({ model: GalleryEvent, schema: galleryEventSchema }),
);

/** Everything the homepage needs, in one request. */
router.get('/site', requireDb, async (req, res) => {
  const [programs, articles, meritYears] = await Promise.all([
    Program.find({ published: true }).sort({ order: 1 }).lean(),
    Article.find({ published: true }).sort({ order: 1 }).limit(3).lean(),
    MeritYear.find({ published: true }).sort({ year: -1 }).limit(1).lean(),
  ]);
  res.json({ programs, articles, latestMeritYear: meritYears[0] ?? null });
});

/** Hall of Fame page: achievers split by group, plus every merit year. */
router.get('/hall-of-fame', requireDb, async (req, res) => {
  const [achievers, meritYears] = await Promise.all([
    Achiever.find({ published: true }).sort({ group: 1, order: 1 }).lean(),
    MeritYear.find({ published: true }).sort({ year: -1 }).lean(),
  ]);

  res.json({
    vtc: achievers.filter((row) => row.group === 'vtc'),
    advanceDit: achievers.filter((row) => row.group === 'advance-dit'),
    meritYears,
  });
});

/** Admin dashboard tiles. */
router.get('/stats', requireDb, requireAuth, requireRole('admin', 'editor'), async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [byStatus, bySource, total, last30, recent, programs, articles, students, gallery] =
    await Promise.all([
      Enquiry.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Enquiry.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Enquiry.find().sort({ createdAt: -1 }).limit(5).lean(),
      Program.countDocuments(),
      Article.countDocuments(),
      Student.countDocuments(),
      GalleryEvent.countDocuments(),
    ]);

  res.json({
    enquiries: {
      total,
      last30,
      byStatus: Object.fromEntries(byStatus.map((row) => [row._id, row.count])),
      bySource: Object.fromEntries(bySource.map((row) => [row._id, row.count])),
      recent,
    },
    content: { programs, articles, students, gallery },
  });
});

export default router;
