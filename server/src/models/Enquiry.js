import mongoose from 'mongoose';

export const ENQUIRY_STATUSES = ['new', 'contacted', 'counselled', 'enrolled', 'closed'];
export const ENQUIRY_ROLES = ['Student', 'Parent / Guardian', 'Other'];

/** A submission from the Get Enrolled form or the Campuses & Contact form. */
const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, trim: true, lowercase: true, default: '' },
    role: { type: String, enum: [...ENQUIRY_ROLES, ''], default: '' },
    course: { type: String, trim: true, default: '' },
    campus: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, maxlength: 4000, default: '' },
    source: { type: String, enum: ['get-enrolled', 'contact'], default: 'get-enrolled' },
    status: { type: String, enum: ENQUIRY_STATUSES, default: 'new', index: true },
    notes: { type: String, trim: true, maxlength: 4000, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true },
);

enquirySchema.index({ createdAt: -1 });

export default mongoose.model('Enquiry', enquirySchema);
