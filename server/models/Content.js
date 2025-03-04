import mongoose from 'mongoose';

const contentFieldSchema = new mongoose.Schema({
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fieldName: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
}, { _id: false });

const contentSchema = new mongoose.Schema({
  contentType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentType',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT',
  },
  fields: [contentFieldSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  publishedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Compound index for unique slugs per content type
contentSchema.index({ contentType: 1, slug: 1 }, { unique: true });

export const Content = mongoose.model('Content', contentSchema);