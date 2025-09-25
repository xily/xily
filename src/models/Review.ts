import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ReviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  company: string;
  internshipId?: mongoose.Types.ObjectId;
  rating: number; // 1-5
  pros: string;
  cons: string;
  advice?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    company: { type: String, required: true, trim: true, index: true },
    internshipId: { type: Schema.Types.ObjectId, ref: 'Internship' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    pros: { type: String, required: true, trim: true },
    cons: { type: String, required: true, trim: true },
    advice: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Enforce one review per user per internship (when internshipId exists)
ReviewSchema.index(
  { userId: 1, internshipId: 1 },
  { unique: true, partialFilterExpression: { internshipId: { $exists: true, $ne: null } } }
);

const Review: Model<ReviewDocument> =
  (typeof window === 'undefined' && mongoose.models && mongoose.models.Review) ||
  mongoose.model<ReviewDocument>('Review', ReviewSchema);

export default Review;


