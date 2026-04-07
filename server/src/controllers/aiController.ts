import { Response } from "express";
import {
  parseJobDescription,
  generateResumeSuggestions,
} from "../services/groqService.js";
import { AuthRequest, ParsedJobData } from "../types/index.js";

export const parseJD = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { jobDescription } = req.body as { jobDescription?: string };

  if (!jobDescription || typeof jobDescription !== "string") {
    res.status(400).json({ message: "jobDescription is required" });
    return;
  }

  if (jobDescription.trim().length < 50) {
    res
      .status(400)
      .json({ message: "Job description is too short to parse" });
    return;
  }

  const parsed = await parseJobDescription(jobDescription);
  res.json({ parsed });
};

export const getSuggestions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { jobDescription, parsedData } = req.body as {
    jobDescription?: string;
    parsedData?: ParsedJobData;
  };

  if (!jobDescription || !parsedData) {
    res
      .status(400)
      .json({ message: "jobDescription and parsedData are required" });
    return;
  }

  const suggestions = await generateResumeSuggestions(
    jobDescription,
    parsedData
  );
  res.json({ suggestions });
};
