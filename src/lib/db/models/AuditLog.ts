import { Schema, model, models } from "mongoose";

export type AuditLogDocument = {
  userId?: typeof Schema.Types.ObjectId | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const AuditLogSchema = new Schema<AuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    action: { type: String, required: true, trim: true, index: true },
    entityType: { type: String, required: true, trim: true, index: true },
    entityId: { type: String, default: null, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: null, index: true },
  },
  { timestamps: true },
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ userId: 1, action: 1, createdAt: -1 });

export const AuditLogModel = models.AuditLog || model<AuditLogDocument>("AuditLog", AuditLogSchema);

