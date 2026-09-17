import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

export const ARTICLE_CATEGORIES = [
  'Choosing a Course',
  'CV & Interviews',
  'Career Paths',
  'AI & Digital Skills',
  'Freelancing & Portfolio',
  'Study & Communication',
  'Office & Productivity',
];

/** One heading with either paragraphs, a bullet list, or both. */
const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true },
    paragraphs: { type: [String], default: [] },
    list: { type: [String], default: [] },
  },
  { _id: false },
);

const articleSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, enum: ARTICLE_CATEGORIES, required: true },
    minutes: { type: Number, default: 5, min: 1, max: 60 },
    summary: { type: String, required: true, trim: true, maxlength: 600 },
    sections: { type: [sectionSchema], default: [] },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

/**
 * Derive the slug only when one was not supplied, and never rewrite it
 * afterwards: the published guides use short curated slugs that do not match
 * their titles, and changing a slug would break every existing link to it.
 * (Mongoose 9 middleware takes no `next` callback — returning is enough.)
 */
articleSchema.pre('validate', function setSlug() {
  if (!this.slug) this.slug = slugify(this.title);
});

export default mongoose.model('Article', articleSchema);
