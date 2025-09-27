import mongoose, { Document, Schema } from 'mongoose';

export interface IAdviceComment extends Document {
  postId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
}

const AdviceCommentSchema = new Schema<IAdviceComment>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'AdvicePost',
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
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.AdviceComment || mongoose.model<IAdviceComment>('AdviceComment', AdviceCommentSchema);
