import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAlertPreference extends Document {
  userId: Types.ObjectId;
  filterId: Types.ObjectId;
  active: boolean;
  createdAt: Date;
}

const AlertPreferenceSchema = new Schema<IAlertPreference>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  filterId: {
    type: Schema.Types.ObjectId,
    ref: 'SavedFilter',
    required: true,
    index: true,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one alert preference per user per filter
AlertPreferenceSchema.index({ userId: 1, filterId: 1 }, { unique: true });

export default (typeof window === 'undefined' && mongoose.models && mongoose.models.AlertPreference) || mongoose.model<IAlertPreference>('AlertPreference', AlertPreferenceSchema);
