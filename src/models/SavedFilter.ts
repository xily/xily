import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISavedFilter extends Document {
  userId: Types.ObjectId;
  graduationYear?: number;
  season?: string;
  location?: string;
  industry?: string;
  createdAt: Date;
}

const SavedFilterSchema = new Schema<ISavedFilter>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  graduationYear: {
    type: Number,
    required: false,
  },
  season: {
    type: String,
    required: false,
    trim: true,
  },
  location: {
    type: String,
    required: false,
    trim: true,
  },
  industry: {
    type: String,
    required: false,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.SavedFilter || mongoose.model<ISavedFilter>('SavedFilter', SavedFilterSchema);


