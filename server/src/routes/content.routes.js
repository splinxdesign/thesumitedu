import { Router } from 'express';
import { validate, pickSubmitted } from '../middleware/validate.js';
import { requireAuth, requireDb, requireRole } from '../middleware/auth.js';
import { ApiError } from '../middleware/error.js';

const requireEditor = [requireAuth, requireRole('admin', 'editor')];

/**
 * Services, projects and testimonials are the same CRUD shape, so they share
 * one router factory. Reads are public and only return published documents;
 * writes require an admin token and see drafts too.
 */
export function createContentRouter({ model, schema, sort = { order: 1, createdAt: -1 } }) {
  const router = Router();
  router.use(requireDb);

  router.get('/', async (req, res) => {
    const items = await model.find({ published: true }).sort(sort).lean();
    res.json(items);
  });

  // Registered before '/:idOrSlug' so the literal path wins the match.
  router.get('/admin/all', ...requireEditor, async (req, res) => {
    const items = await model.find().sort(sort).lean();
    res.json(items);
  });

  router.post('/', ...requireEditor, validate(schema), async (req, res) => {
    const doc = await model.create(req.body);
    res.status(201).json(doc);
  });

  router.patch('/:id', ...requireEditor, validate(schema.partial()), async (req, res) => {
    const doc = await model.findById(req.params.id);
    if (!doc) throw new ApiError(404, 'Not found.');
    doc.set(pickSubmitted(req));
    await doc.save(); // .save() rather than findByIdAndUpdate so slug hooks run
    res.json(doc);
  });

  router.delete('/:id', ...requireEditor, async (req, res) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, 'Not found.');
    res.json({ ok: true });
  });

  router.get('/:idOrSlug', async (req, res) => {
    const { idOrSlug } = req.params;
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
    const doc = await model
      .findOne(isObjectId ? { _id: idOrSlug } : { slug: idOrSlug })
      .lean();
    if (!doc || doc.published === false) throw new ApiError(404, 'Not found.');
    res.json(doc);
  });

  return router;
}
