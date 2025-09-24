import mongoose, { Document, Schema } from 'mongoose';

export interface ISavedInternship extends Document {
  userId: mongoose.Types.ObjectId;
  internshipId: mongoose.Types.ObjectId;
  savedAt: Date;
}

const SavedInternshipSchema = new Schema<ISavedInternship>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  internshipId: {
    type: Schema.Types.ObjectId,
    ref: 'Internship',
    required: true,
  },
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to prevent duplicate saves
SavedInternshipSchema.index({ userId: 1, internshipId: 1 }, { unique: true });

export default (typeof window === 'undefined' && mongoose.models && mongoose.models.SavedInternship) || mongoose.model<ISavedInternship>('SavedInternship', SavedInternshipSchema);
