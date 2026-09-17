import mongoose from 'mongoose';

export const GALLERY_CATEGORIES = [
  'National Celebration',
  'Awareness Campaign',
  'Academic Recognition',
  'Educational Visit',
  'Technology Exposure',
  'Religious / Cultural Event',
];

const galleryEventSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 600 },
    dateLabel: { type: String, trim: true, default: '' },
    category: { type: String, enum: GALLERY_CATEGORIES, required: true },
    image: { type: String, required: true, trim: true },
    alt: { type: String, required: true, trim: true, maxlength: 300 },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('GalleryEvent', galleryEventSchema);
