import { z } from 'zod';
import { ENQUIRY_STATUSES, ENQUIRY_ROLES } from '../models/Enquiry.js';
import { PROGRAM_CATEGORIES } from '../models/Program.js';
import { ARTICLE_CATEGORIES } from '../models/Article.js';
import { ACHIEVER_GROUPS } from '../models/Achiever.js';
import { GALLERY_CATEGORIES } from '../models/GalleryEvent.js';

const emailRequired = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .max(254)
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Please enter a valid email address.');

const emailOptional = z
  .string()
  .trim()
  .max(254)
  .refine((value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value), {
    message: 'Please enter a valid email address.',
  })
  .optional()
  .default('');

const optionalText = (max) => z.string().trim().max(max).optional().default('');

// Zod's built-in boolean coercion would turn the string "false" into true.
const bool = z.union([
  z.boolean(),
  z.enum(['true', 'false']).transform((value) => value === 'true'),
]);

/* ----------------------------------------------------------------- auth */

export const loginSchema = z.object({
  email: emailRequired,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: emailRequired,
  password: z.string().min(8, 'Use at least 8 characters'),
});

/* ------------------------------------------------------------- enquiries */

export const enquiryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  phone: z.string().trim().min(7, 'Please enter your phone number.').max(40),
  email: emailOptional,
  role: z.enum(['', ...ENQUIRY_ROLES]).optional().default(''),
  course: z.string().trim().min(1, 'Please select a course.').max(140),
  // THE SUMIT operates a single campus, so this is no longer a required choice
  // on the form — kept optional for older clients and admin-entered records.
  campus: optionalText(140),
  message: optionalText(4000),
  source: z.enum(['get-enrolled', 'contact']).optional().default('get-enrolled'),
  // Honeypot: has to pass validation so the route can accept-and-discard.
  website: z.string().max(200).optional().default(''),
});

/** The Campuses & Contact form asks for less than the enrolment form. */
export const contactCreateSchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  phone: z.string().trim().min(7, 'Please enter your phone number.').max(40),
  email: emailOptional,
  message: z.string().trim().min(5, 'Please write a short message.').max(4000),
  website: z.string().max(200).optional().default(''),
});

export const enquiryUpdateSchema = z
  .object({
    status: z.enum(ENQUIRY_STATUSES).optional(),
    notes: z.string().trim().max(4000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' });

/* -------------------------------------------------------------- content */

/** One heading with a list of items — the same shape for an article body
 * section and a program's curriculum section (e.g. "Semester I"). */
const sectionSchema = z.object({
  heading: z.string().trim().min(2).max(200),
  paragraphs: z.array(z.string().trim().min(1).max(3000)).max(12).optional().default([]),
  list: z.array(z.string().trim().min(1).max(600)).max(20).optional().default([]),
});

const scheduleRowSchema = z.object({
  group: optionalText(80),
  days: optionalText(80),
  timings: optionalText(80),
});

export const programSchema = z.object({
  code: z.string().trim().min(1).max(12),
  name: z.string().trim().min(2).max(140),
  nameUrdu: optionalText(200),
  category: z.enum(PROGRAM_CATEGORIES),
  badge: optionalText(80),
  duration: optionalText(60),
  fee: optionalText(60),
  feeDetails: z.array(z.string().trim().min(1).max(120)).max(10).optional().default([]),
  eligibility: optionalText(400),
  summary: z.string().trim().min(10).max(600),
  audience: optionalText(400),
  learn: z.array(z.string().trim().min(1).max(200)).max(15).optional().default([]),
  direction: optionalText(400),
  cta: optionalText(80),
  featured: bool.optional().default(false),
  order: z.coerce.number().int().min(0).max(999).optional().default(0),
  published: bool.optional().default(true),

  registeredBy: optionalText(200),
  curriculum: z.array(sectionSchema).max(15).optional().default([]),
  documentsRequired: z.array(z.string().trim().min(1).max(200)).max(15).optional().default([]),
  schedule: z.array(scheduleRowSchema).max(10).optional().default([]),
  scheduleNote: optionalText(500),
});

export const articleSchema = z.object({
  title: z.string().trim().min(4).max(200),
  category: z.enum(ARTICLE_CATEGORIES),
  minutes: z.coerce.number().int().min(1).max(60).optional().default(5),
  summary: z.string().trim().min(10).max(600),
  sections: z.array(sectionSchema).max(15).optional().default([]),
  order: z.coerce.number().int().min(0).max(999).optional().default(0),
  published: bool.optional().default(true),
});

export const achieverSchema = z.object({
  group: z.enum(ACHIEVER_GROUPS),
  order: z.coerce.number().int().min(1).max(999),
  studentName: z.string().trim().min(2).max(120),
  score: z.string().trim().min(1).max(12),
  published: bool.optional().default(true),
});

export const meritYearSchema = z.object({
  year: z.string().trim().regex(/^\d{4}$/, 'Use a four-digit year'),
  label: z.string().trim().min(2).max(120),
  records: z
    .array(
      z.object({
        position: z.string().trim().min(1).max(12),
        studentName: z.string().trim().min(2).max(120),
        // Defaults to the exam these positions come from when the admin form
        // only supplies "position: name" pairs.
        program: z.string().trim().max(80).optional().default('XII Commerce'),
      }),
    )
    .max(20)
    .optional()
    .default([]),
  note: optionalText(300),
  supportingNote: optionalText(300),
  published: bool.optional().default(true),
});

export const galleryEventSchema = z.object({
  key: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(600),
  dateLabel: optionalText(60),
  category: z.enum(GALLERY_CATEGORIES),
  image: z.string().trim().min(1).max(400),
  alt: z.string().trim().min(5).max(300),
  order: z.coerce.number().int().min(0).max(999).optional().default(0),
  published: bool.optional().default(true),
});

/* ------------------------------------------------------------- students */

export const studentSchema = z.object({
  grNumber: z.string().trim().regex(/^\d+$/, 'GR Numbers contain digits only.').max(20),
  studentName: z.string().trim().min(2).max(120),
  fatherName: z.string().trim().min(2).max(120),
  program: z.string().trim().min(2).max(140),
  status: z.string().trim().max(140).optional().default('Active / Verified Student Record'),
  campus: optionalText(120),
  verifiable: bool.optional().default(true),
});

export const verifySchema = z.object({
  gr: z
    .string()
    .trim()
    .min(1, 'Please enter a GR Number to verify a student record.')
    .max(20)
    .regex(/^\d+$/, 'GR Numbers contain digits only. Please remove letters or symbols and try again.'),
});

/* ---------------------------------------------------------------- lists */

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  status: z.enum(ENQUIRY_STATUSES).optional(),
  source: z.enum(['get-enrolled', 'contact']).optional(),
  q: z.string().trim().max(120).optional(),
});
