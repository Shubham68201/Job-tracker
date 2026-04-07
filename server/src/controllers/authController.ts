import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { createError } from "../middleware/error.js";
import { AuthRequest } from "../types/index.js";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const signToken = (userId: string, email: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw createError("JWT_SECRET not configured", 500);
  return jwt.sign({ userId, email }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as any,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: result.error.errors[0]?.message ?? "Validation failed",
    });
    return;
  }

  const { name, email, password } = result.data;

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ message: "Email already in use" });
    return;
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user._id.toString(), user.email);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({
      message: result.error.errors[0]?.message ?? "Validation failed",
    });
    return;
  }

  const { email, password } = result.data;

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const token = signToken(user._id.toString(), user.email);

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await User.findById(req.user?.userId).select("-password");
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({ user });
};
