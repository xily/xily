import mongoose, { Document, Schema } from 'mongoose';

export interface IRecruiter extends Document {
  userId: mongoose.Types.ObjectId;
  companyName: string;
  website: string;
  createdAt: Date;
}

const RecruiterSchema = new Schema<IRecruiter>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  website: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Recruiter || mongoose.model<IRecruiter>('Recruiter', RecruiterSchema);
