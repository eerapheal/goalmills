import mongoose from 'mongoose';

export const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide a category slug'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#3B82F6', // Blue default
    },
    icon: {
      type: String,
      default: 'newspaper',
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;
