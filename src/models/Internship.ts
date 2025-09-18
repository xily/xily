import mongoose, { Schema, Model, Document } from 'mongoose';

export interface InternshipDocument extends Document {
  title: string;
  company: string;
  location?: string;
  industry?: string;
  graduationYear?: number;
  season?: string;
  deadline?: Date;
  applyLink?: string;
  verified: boolean;
  createdAt: Date;
}

const InternshipSchema = new Schema<InternshipDocument>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    industry: { type: String },
    graduationYear: { type: Number },
    season: { type: String },
    deadline: { type: Date },
    applyLink: { type: String },
    verified: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Internship: Model<InternshipDocument> =
  mongoose.models.Internship || mongoose.model<InternshipDocument>('Internship', InternshipSchema);

export default Internship;


