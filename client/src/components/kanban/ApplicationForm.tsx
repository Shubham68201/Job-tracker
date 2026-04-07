import { useState, FormEvent } from "react";
import { FiX, FiPlus, FiSave } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "../../hooks/redux";
import { createApplication, updateApplication } from "../../store/slices/applicationsSlice";
import type { Application, ApplicationStatus, ParsedJobData } from "../../types";
import { KANBAN_COLUMNS } from "../../types";
import AIParser from "../ai/AIParser";

interface Props {
  application?: Application;
  onClose: () => void;
}

const emptyForm = {
  company: "",
  role: "",
  status: "Applied" as ApplicationStatus,
  jdLink: "",
  notes: "",
  dateApplied: new Date().toISOString().split("T")[0],
  salaryRange: "",
  location: "",
  seniority: "",
  requiredSkills: [] as string[],
  niceToHaveSkills: [] as string[],
  resumeSuggestions: [] as string[],
};

export default function ApplicationForm({ application, onClose }: Props) {
  const dispatch = useAppDispatch();
  const isEdit = !!application;

  const [form, setForm] = useState({
    company: application?.company ?? "",
    role: application?.role ?? "",
    status: application?.status ?? ("Applied" as ApplicationStatus),
    jdLink: application?.jdLink ?? "",
    notes: application?.notes ?? "",
    dateApplied: application?.dateApplied
      ? new Date(application.dateApplied).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    salaryRange: application?.salaryRange ?? "",
    location: application?.location ?? "",
    seniority: application?.seniority ?? "",
    requiredSkills: application?.requiredSkills ?? [],
    niceToHaveSkills: application?.niceToHaveSkills ?? [],
    resumeSuggestions: application?.resumeSuggestions ?? [],
  });

  const [skillInput, setSkillInput] = useState("");
  const [niceSkillInput, setNiceSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAI, setShowAI] = useState(!isEdit);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addSkill = (type: "required" | "nice") => {
    const val = type === "required" ? skillInput.trim() : niceSkillInput.trim();
    if (!val) return;
    if (type === "required") {
      if (!form.requiredSkills.includes(val))
        set("requiredSkills", [...form.requiredSkills, val]);
      setSkillInput("");
    } else {
      if (!form.niceToHaveSkills.includes(val))
        set("niceToHaveSkills", [...form.niceToHaveSkills, val]);
      setNiceSkillInput("");
    }
  };

  const removeSkill = (type: "required" | "nice", skill: string) => {
    if (type === "required")
      set("requiredSkills", form.requiredSkills.filter((s) => s !== skill));
    else set("niceToHaveSkills", form.niceToHaveSkills.filter((s) => s !== skill));
  };

  const handleParsed = (data: ParsedJobData, suggestions: string[]) => {
    setForm((f) => ({
      ...f,
      company: data.company || f.company,
      role: data.role || f.role,
      location: data.location || f.location,
      seniority: data.seniority || f.seniority,
      requiredSkills: data.requiredSkills.length ? data.requiredSkills : f.requiredSkills,
      niceToHaveSkills: data.niceToHaveSkills.length ? data.niceToHaveSkills : f.niceToHaveSkills,
      resumeSuggestions: suggestions.length ? suggestions : f.resumeSuggestions,
    }));
    toast.success("Fields populated by AI!");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      toast.error("Company and role are required");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit) {
        await dispatch(updateApplication({ id: application._id, data: form }));
        toast.success("Application updated");
      } else {
        await dispatch(createApplication(form));
        toast.success("Application added!");
      }
      onClose();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] card-glass flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h2 className="font-display font-bold text-lg text-white">
            {isEdit ? "Edit Application" : "Add Application"}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6 space-y-6">
            {/* AI Parser section */}
            {!isEdit && (
              <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                <button
                  type="button"
                  onClick={() => setShowAI(!showAI)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 mb-3 flex items-center gap-1"
                >
                  {showAI ? "▾" : "▸"} {showAI ? "Hide" : "Show"} AI Parser
                </button>
                {showAI && <AIParser onParsed={handleParsed} />}
              </div>
            )}

            {/* Core fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Company *
                </label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  placeholder="Google"
                  required
                  className="input-custom"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Role *
                </label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  placeholder="Senior Software Engineer"
                  required
                  className="input-custom"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value as ApplicationStatus)}
                  className="input-custom"
                >
                  {KANBAN_COLUMNS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Date Applied
                </label>
                <input
                  type="date"
                  value={form.dateApplied}
                  onChange={(e) => set("dateApplied", e.target.value)}
                  className="input-custom"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Remote / New York, NY"
                  className="input-custom"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Seniority
                </label>
                <input
                  type="text"
                  value={form.seniority}
                  onChange={(e) => set("seniority", e.target.value)}
                  placeholder="Senior"
                  className="input-custom"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Salary Range
                </label>
                <input
                  type="text"
                  value={form.salaryRange}
                  onChange={(e) => set("salaryRange", e.target.value)}
                  placeholder="$120k – $160k"
                  className="input-custom"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  JD Link
                </label>
                <input
                  type="url"
                  value={form.jdLink}
                  onChange={(e) => set("jdLink", e.target.value)}
                  placeholder="https://..."
                  className="input-custom"
                />
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Required Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("required"))}
                  placeholder="Type a skill and press Enter"
                  className="input-custom"
                />
                <button
                  type="button"
                  onClick={() => addSkill("required")}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex-shrink-0"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              {form.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.requiredSkills.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => removeSkill("required", s)}
                      className="skill-tag bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-colors flex items-center gap-1"
                    >
                      {s} <FiX className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nice to Have Skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Nice to Have Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={niceSkillInput}
                  onChange={(e) => setNiceSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("nice"))}
                  placeholder="Type a skill and press Enter"
                  className="input-custom"
                />
                <button
                  type="button"
                  onClick={() => addSkill("nice")}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors flex-shrink-0"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
              {form.niceToHaveSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {form.niceToHaveSkills.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => removeSkill("nice", s)}
                      className="skill-tag bg-purple-500/15 text-purple-300 border border-purple-500/25 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-colors flex items-center gap-1"
                    >
                      {s} <FiX className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Referral from John, recruiter name, follow-up date…"
                rows={3}
                className="input-custom resize-none"
              />
            </div>

            {/* AI Suggestions preview */}
            {form.resumeSuggestions.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">
                  ✦ AI Resume Suggestions ({form.resumeSuggestions.length})
                </p>
                <ul className="space-y-1">
                  {form.resumeSuggestions.map((b, i) => (
                    <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                      <span className="text-amber-500 font-bold">{i + 1}.</span>
                      <span className="line-clamp-2">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700/50 flex gap-3 justify-end bg-slate-900/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-custom text-sm px-5"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs" />
              ) : isEdit ? (
                <FiSave className="w-4 h-4" />
              ) : (
                <FiPlus className="w-4 h-4" />
              )}
              {submitting ? "Saving…" : isEdit ? "Save Changes" : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
