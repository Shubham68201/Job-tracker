import mongoose, { Document, Schema } from "mongoose";
import { ApplicationStatus } from "../types/index.js";

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  status: ApplicationStatus;
  jdLink?: string;
  notes?: string;
  dateApplied: Date;
  salaryRange?: string;
  location?: string;
  seniority?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  resumeSuggestions: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Applied", "Phone Screen", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    jdLink: { type: String, trim: true },
    notes: { type: String },
    dateApplied: { type: Date, default: Date.now },
    salaryRange: { type: String, trim: true },
    location: { type: String, trim: true },
    seniority: { type: String, trim: true },
    requiredSkills: [{ type: String }],
    niceToHaveSkills: [{ type: String }],
    resumeSuggestions: [{ type: String }],
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Application = mongoose.model<IApplication>(
  "Application",
  applicationSchema
);
