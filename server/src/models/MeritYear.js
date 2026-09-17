import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    position: { type: String, required: true, trim: true, maxlength: 12 },
    studentName: { type: String, required: true, trim: true, maxlength: 120 },
    program: { type: String, trim: true, default: 'XII Commerce' },
  },
  { _id: false },
);

/**
 * One examination year of board merit positions. A year can legitimately have
 * no records — 2020 was cancelled — hence `note` and `supportingNote`.
 */
const meritYearSchema = new mongoose.Schema(
  {
    year: { type: String, required: true, unique: true, trim: true },
    label: { type: String, required: true, trim: true },
    records: { type: [recordSchema], default: [] },
    note: { type: String, trim: true, default: '' },
    supportingNote: { type: String, trim: true, default: '' },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('MeritYear', meritYearSchema);
