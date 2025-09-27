import mongoose, { Document, Schema } from 'mongoose';

export interface IAdvicePost extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
}

const AdvicePostSchema = new Schema<IAdvicePost>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.AdvicePost || mongoose.model<IAdvicePost>('AdvicePost', AdvicePostSchema);
