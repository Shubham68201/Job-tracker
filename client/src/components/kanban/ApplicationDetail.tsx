import { useState } from "react";
import {
  FiX, FiEdit2, FiTrash2, FiCopy, FiCheck, FiMapPin,
  FiDollarSign, FiCalendar, FiExternalLink, FiStar, FiZap
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "../../hooks/redux";
import { updateApplication, deleteApplication } from "../../store/slices/applicationsSlice";
import type { Application, ApplicationStatus } from "../../types";
import { STATUS_COLORS, KANBAN_COLUMNS } from "../../types";

interface Props {
  application: Application;
  onClose: () => void;
  onEdit: () => void;
}

export default function ApplicationDetail({ application, onClose, onEdit }: Props) {
  const dispatch = useAppDispatch();
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    await dispatch(deleteApplication(application._id));
    toast.success("Application deleted");
    onClose();
  };

  const handleStatusChange = async (status: ApplicationStatus) => {
    await dispatch(updateApplication({ id: application._id, data: { status } }));
    toast.success(`Moved to ${status}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] card-glass flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700/50">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="font-display text-xl font-bold text-white truncate">{application.role}</h2>
            <p className="text-indigo-400 font-medium mt-0.5">{application.company}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {KANBAN_COLUMNS.map((col) => (
                <button
                  key={col}
                  onClick={() => handleStatusChange(col)}
                  className={`skill-tag border transition-all ${
                    application.status === col
                      ? STATUS_COLORS[col] + " ring-1 ring-current"
                      : "bg-slate-700/30 text-slate-400 border-slate-600/30 hover:bg-slate-700"
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={onEdit} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-indigo-400 transition-colors">
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`p-2 rounded-lg transition-colors ${
                confirmDelete
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "hover:bg-slate-700 text-slate-400 hover:text-red-400"
              }`}
              title={confirmDelete ? "Click again to confirm" : "Delete"}
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {application.location && (
              <div className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="text-sm text-slate-200">{application.location}</p>
                </div>
              </div>
            )}
            {application.seniority && (
              <div className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-2">
                <FiZap className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Seniority</p>
                  <p className="text-sm text-slate-200">{application.seniority}</p>
                </div>
              </div>
            )}
            {application.salaryRange && (
              <div className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-2">
                <FiDollarSign className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Salary Range</p>
                  <p className="text-sm text-slate-200">{application.salaryRange}</p>
                </div>
              </div>
            )}
            <div className="bg-slate-900/50 rounded-lg p-3 flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Applied</p>
                <p className="text-sm text-slate-200">
                  {new Date(application.dateApplied).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric"
                  })}
                </p>
              </div>
            </div>
          </div>

          {application.jdLink && (
            <a
              href={application.jdLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              <FiExternalLink className="w-4 h-4" />
              View job posting
            </a>
          )}

          {/* Skills */}
          {application.requiredSkills.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {application.requiredSkills.map((s) => (
                  <span key={s} className="skill-tag bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{s}</span>
                ))}
              </div>
            </div>
          )}

          {application.niceToHaveSkills.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Nice to Have</h3>
              <div className="flex flex-wrap gap-1.5">
                {application.niceToHaveSkills.map((s) => (
                  <span key={s} className="skill-tag bg-purple-500/10 text-purple-300 border border-purple-500/20">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Resume Suggestions */}
          {application.resumeSuggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <FiStar className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-amber-400">AI Resume Suggestions</h3>
              </div>
              <div className="space-y-2">
                {application.resumeSuggestions.map((bullet, idx) => (
                  <div key={idx} className="group flex items-start gap-3 bg-amber-500/5 border border-amber-500/15 rounded-lg p-3">
                    <span className="flex-shrink-0 w-5 h-5 bg-amber-500/20 text-amber-400 rounded text-xs flex items-center justify-center font-mono font-bold mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="flex-1 text-sm text-slate-300 leading-relaxed">{bullet}</p>
                    <button
                      onClick={() => handleCopy(bullet, idx)}
                      className="flex-shrink-0 p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-amber-500/20 text-slate-500 hover:text-amber-400 transition-all"
                    >
                      {copiedIdx === idx ? <FiCheck className="w-3.5 h-3.5" /> : <FiCopy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {application.notes && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-slate-300 bg-slate-900/50 rounded-lg p-3 whitespace-pre-wrap leading-relaxed">
                {application.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
