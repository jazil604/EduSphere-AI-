import { Schema, model, models } from "mongoose";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

export type AttendanceDocument = {
  studentId: typeof Schema.Types.ObjectId;
  courseId: typeof Schema.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  markedBy: typeof Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

const AttendanceSchema = new Schema<AttendanceDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    date: { type: Date, required: true, index: true },
    status: { type: String, enum: ["PRESENT", "ABSENT", "LATE"], required: true, index: true },
    markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true },
);

AttendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

export const AttendanceModel = models.Attendance || model<AttendanceDocument>("Attendance", AttendanceSchema);

