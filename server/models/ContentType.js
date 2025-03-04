import mongoose from 'mongoose';

const validationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  params: {
    type: String,
  },
}, { _id: false });

const fieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['TEXT', 'RICH_TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'MEDIA', 'REFERENCE'],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
  },
  validations: [validationSchema],
});

const contentTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  fields: [fieldSchema],
}, {
  timestamps: true,
});

export const ContentType = mongoose.model('ContentType', contentTypeSchema);