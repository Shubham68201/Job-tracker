import { Response } from "express";
import { Application } from "../models/Application.js";
import { AuthRequest, ApplicationStatus } from "../types/index.js";
import { createError } from "../middleware/error.js";
import { z } from "zod";

const VALID_STATUSES: ApplicationStatus[] = [
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Rejected",
];

const applicationSchema = z.object({
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  status: z.enum([
    "Applied",
    "Phone Screen",
    "Interview",
    "Offer",
    "Rejected",
  ]).optional(),
  jdLink: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  dateApplied: z.string().optional(),
  salaryRange: z.string().optional(),
  location: z.string().optional(),
  seniority: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  niceToHaveSkills: z.array(z.string()).optional(),
  resumeSuggestions: z.array(z.string()).optional(),
  order: z.number().optional(),
});

export const getApplications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const applications = await Application.find({ userId }).sort({
    status: 1,
    order: 1,
    createdAt: -1,
  });
  res.json({ applications });
};

export const createApplication = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const result = applicationSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: result.error.errors[0]?.message ?? "Validation failed",
    });
    return;
  }

  const count = await Application.countDocuments({
    userId,
    status: result.data.status ?? "Applied",
  });

  const application = await Application.create({
    ...result.data,
    userId,
    order: count,
  });

  res.status(201).json({ application });
};

export const updateApplication = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const application = await Application.findOne({ _id: id, userId });
  if (!application) {
    throw createError("Application not found", 404);
  }

  const result = applicationSchema.partial().safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: result.error.errors[0]?.message ?? "Validation failed",
    });
    return;
  }

  Object.assign(application, result.data);
  await application.save();

  res.json({ application });
};

export const deleteApplication = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.userId;

  const application = await Application.findOneAndDelete({ _id: id, userId });
  if (!application) {
    throw createError("Application not found", 404);
  }

  res.json({ message: "Application deleted" });
};

export const updateOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;
  const { updates } = req.body as {
    updates: Array<{ id: string; status: string; order: number }>;
  };

  if (!Array.isArray(updates)) {
    res.status(400).json({ message: "Invalid updates format" });
    return;
  }

  const validStatuses = new Set(VALID_STATUSES);
  const ops = updates
    .filter((u) => validStatuses.has(u.status as ApplicationStatus))
    .map((u) => ({
      updateOne: {
        filter: { _id: u.id, userId },
        update: { status: u.status as ApplicationStatus, order: u.order },
      },
    }));

  await Application.bulkWrite(ops);
  res.json({ message: "Order updated" });
};
