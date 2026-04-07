import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FiMapPin, FiCalendar, FiStar } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import type { Application } from "../../types";
import { STATUS_COLORS } from "../../types";

interface Props {
  application: Application;
  onClick: () => void;
}

export default function ApplicationCard({ application, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const dateApplied = new Date(application.dateApplied).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 hover:border-indigo-500/40 hover:bg-slate-800 transition-all duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="mt-0.5 text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MdDragIndicator className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Company & Role */}
          <div className="mb-2">
            <h3 className="font-display font-semibold text-slate-100 text-sm truncate group-hover:text-white transition-colors">
              {application.role}
            </h3>
            <p className="text-slate-400 text-xs mt-0.5 truncate font-medium">
              {application.company}
            </p>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {application.location && (
              <span className="flex items-center gap-1">
                <FiMapPin className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{application.location}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {dateApplied}
            </span>
          </div>

          {/* Skills */}
          {application.requiredSkills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2.5">
              {application.requiredSkills.slice(0, 3).map((skill) => (
                <span
                  key={skill}
                  className="skill-tag bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  {skill}
                </span>
              ))}
              {application.requiredSkills.length > 3 && (
                <span className="skill-tag bg-slate-700/50 text-slate-400 border border-slate-600/30">
                  +{application.requiredSkills.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Bottom row */}
          <div className="flex items-center justify-between mt-3">
            <span className={`skill-tag border ${STATUS_COLORS[application.status]}`}>
              {application.status}
            </span>
            {application.resumeSuggestions.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-400/70">
                <FiStar className="w-3 h-3" />
                AI tips
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
