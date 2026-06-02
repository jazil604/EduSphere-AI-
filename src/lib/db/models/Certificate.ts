import { Schema, model, models } from "mongoose";

export type CertificateDocument = {
  studentId: typeof Schema.Types.ObjectId;
  courseId: typeof Schema.Types.ObjectId;
  certificateId: string;
  title: string;
  issuedAt: Date;
  score: number;
  url?: string;
  createdAt: Date;
  updatedAt: Date;
};

const CertificateSchema = new Schema<CertificateDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    certificateId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    issuedAt: { type: Date, default: Date.now, index: true },
    score: { type: Number, required: true, min: 0, max: 100, index: true },
    url: { type: String, trim: true },
  },
  { timestamps: true },
);

CertificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const CertificateModel =
  models.Certificate || model<CertificateDocument>("Certificate", CertificateSchema);
