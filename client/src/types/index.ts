export type ApplicationStatus =
  | "Applied"
  | "Phone Screen"
  | "Interview"
  | "Offer"
  | "Rejected";

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  jdLink?: string;
  notes?: string;
  dateApplied: string;
  salaryRange?: string;
  location?: string;
  seniority?: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  resumeSuggestions: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ParsedJobData {
  company: string;
  role: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  seniority: string;
  location: string;
}

export interface ApiError {
  message: string;
}

export const KANBAN_COLUMNS: ApplicationStatus[] = [
  "Applied",
  "Phone Screen",
  "Interview",
  "Offer",
  "Rejected",
];

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  Applied: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Phone Screen": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Interview: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Offer: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Rejected: "bg-red-500/20 text-red-300 border-red-500/30",
};

export const STATUS_DOT_COLORS: Record<ApplicationStatus, string> = {
  Applied: "bg-blue-400",
  "Phone Screen": "bg-amber-400",
  Interview: "bg-purple-400",
  Offer: "bg-emerald-400",
  Rejected: "bg-red-400",
};

export const COLUMN_COLORS: Record<ApplicationStatus, string> = {
  Applied: "border-t-blue-500",
  "Phone Screen": "border-t-amber-500",
  Interview: "border-t-purple-500",
  Offer: "border-t-emerald-500",
  Rejected: "border-t-red-500",
};
