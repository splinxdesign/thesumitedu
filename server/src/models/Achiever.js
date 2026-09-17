import mongoose from 'mongoose';

export const ACHIEVER_GROUPS = ['vtc', 'advance-dit'];

/**
 * A named high scorer shown on the Hall of Fame. `group` separates the
 * VTC 90%+ list from the Advance DIT top achievers.
 */
const achieverSchema = new mongoose.Schema(
  {
    group: { type: String, enum: ACHIEVER_GROUPS, required: true, index: true },
    order: { type: Number, required: true },
    studentName: { type: String, required: true, trim: true, maxlength: 120 },
    score: { type: String, required: true, trim: true, maxlength: 12 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('Achiever', achieverSchema);
