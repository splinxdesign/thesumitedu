import mongoose from 'mongoose';

/**
 * The record behind the public GR Number lookup.
 *
 * Only the fields in `toPublicJSON` are ever exposed to the verification
 * endpoint — the privacy policy explicitly promises that CNIC/B-Form numbers,
 * phone numbers, addresses, fee records and internal remarks stay private, so
 * they are kept `select: false` and never serialised publicly.
 */
const studentSchema = new mongoose.Schema(
  {
    grNumber: { type: String, required: true, unique: true, trim: true, index: true },
    studentName: { type: String, required: true, trim: true, maxlength: 120 },
    fatherName: { type: String, required: true, trim: true, maxlength: 120 },
    program: { type: String, required: true, trim: true, maxlength: 140 },
    // Free text rather than a fixed enum — the admission office needs to
    // record things a closed list can't: "Left in March 2026", "Admission
    // Cancelled — fee refunded", and so on, in their own words.
    status: {
      type: String,
      trim: true,
      maxlength: 140,
      default: 'Active / Verified Student Record',
    },
    campus: { type: String, trim: true, default: '' },

    // Private — never returned by the public verification route.
    contactNumber: { type: String, trim: true, default: '', select: false },
    address: { type: String, trim: true, default: '', select: false },
    internalNotes: { type: String, trim: true, default: '', select: false },

    verifiable: { type: Boolean, default: true },
  },
  { timestamps: true },
);

studentSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    grNumber: this.grNumber,
    studentName: this.studentName,
    fatherName: this.fatherName,
    program: this.program,
    status: this.status,
  };
};

export default mongoose.model('Student', studentSchema);
