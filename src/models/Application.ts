import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  userId: mongoose.Types.ObjectId;
  internshipId: mongoose.Types.ObjectId;
  status: 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  notes?: string;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
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
  status: {
    type: String,
    enum: ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'],
    default: 'Saved',
    required: true,
  },
  notes: {
    type: String,
    maxlength: 500,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound index to prevent duplicate applications
ApplicationSchema.index({ userId: 1, internshipId: 1 }, { unique: true });

// Update updatedAt on save
ApplicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
