import mongoose, { Document, Schema } from 'mongoose';

export interface IResumeComment extends Document {
  resumeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
}

const ResumeCommentSchema = new Schema<IResumeComment>({
  resumeId: {
    type: Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.ResumeComment || mongoose.model<IResumeComment>('ResumeComment', ResumeCommentSchema);
