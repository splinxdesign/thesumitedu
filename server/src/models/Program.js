import mongoose from 'mongoose';
import { slugify } from '../utils/slugify.js';

export const PROGRAM_CATEGORIES = [
  'Diploma Programs',
  'IT & Technology',
  'AI & Digital Skills',
  'Creative Skills',
  'Language & Communication',
  'Office Productivity',
];

/** One curriculum heading (e.g. "Semester I") with its list of topics. */
const curriculumSectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true },
    paragraphs: { type: [String], default: [] },
    list: { type: [String], default: [] },
  },
  { _id: false },
);

/** One row of the class schedule table (e.g. "Morning Group / Thu & Fri / 9-10am"). */
const scheduleRowSchema = new mongoose.Schema(
  {
    group: { type: String, trim: true, default: '' },
    days: { type: String, trim: true, default: '' },
    timings: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const programSchema = new mongoose.Schema(
  {
    slug: { type: String, unique: true, index: true },
    code: { type: String, required: true, trim: true, maxlength: 12 },
    name: { type: String, required: true, trim: true, maxlength: 140 },
    nameUrdu: { type: String, trim: true, default: '' },
    category: { type: String, enum: PROGRAM_CATEGORIES, required: true },
    badge: { type: String, trim: true, default: '' },
    duration: { type: String, trim: true, default: '' },
    fee: { type: String, trim: true, default: '' },
    feeDetails: { type: [String], default: [] },
    eligibility: { type: String, trim: true, default: '' },
    summary: { type: String, required: true, trim: true, maxlength: 600 },
    audience: { type: String, trim: true, default: '' },
    learn: { type: [String], default: [] },
    direction: { type: String, trim: true, default: '' },
    cta: { type: String, trim: true, default: '' },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },

    // -- syllabus / official-paperwork content, from the institute's own
    // course handouts (fee amounts on those handouts are deliberately not
    // stored here — see FEE_NOTE / the admin hint on the fee fields).
    registeredBy: { type: String, trim: true, default: '' },
    curriculum: { type: [curriculumSectionSchema], default: [] },
    documentsRequired: { type: [String], default: [] },
    schedule: { type: [scheduleRowSchema], default: [] },
    scheduleNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

/**
 * Derive the slug only when one was not supplied, and never rewrite it
 * afterwards — renaming a program should not break links that already point
 * at it. (Mongoose 9 middleware takes no `next` callback.)
 */
programSchema.pre('validate', function setSlug() {
  if (!this.slug) this.slug = slugify(this.name);
});

export default mongoose.model('Program', programSchema);
