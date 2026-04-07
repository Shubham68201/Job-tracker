import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Application, ApplicationStatus } from "../../types";
import { COLUMN_COLORS, STATUS_DOT_COLORS } from "../../types";
import ApplicationCard from "./ApplicationCard";

interface Props {
  status: ApplicationStatus;
  applications: Application[];
  onCardClick: (app: Application) => void;
}

export default function KanbanColumn({ status, applications, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] w-full flex-shrink-0">
      {/* Column header */}
      <div className={`card-glass border-t-2 ${COLUMN_COLORS[status]} px-4 py-3 mb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
            <h2 className="font-display font-semibold text-slate-200 text-sm">{status}</h2>
          </div>
          <span className="text-xs font-mono font-medium bg-slate-700/80 text-slate-300 px-2 py-0.5 rounded-full">
            {applications.length}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 kanban-col rounded-xl min-h-[200px] p-2 transition-colors duration-200 ${
          isOver ? "bg-indigo-500/5 ring-1 ring-indigo-500/30" : "bg-transparent"
        }`}
      >
        <SortableContext
          items={applications.map((a) => a._id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <ApplicationCard
              key={app._id}
              application={app}
              onClick={() => onCardClick(app)}
            />
          ))}
        </SortableContext>

        {applications.length === 0 && (
          <div className="h-full min-h-[120px] flex items-center justify-center rounded-lg border border-dashed border-slate-700/50">
            <p className="text-slate-600 text-xs text-center">
              Drop cards here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
