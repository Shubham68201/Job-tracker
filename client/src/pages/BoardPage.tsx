import { useEffect, useState } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { fetchApplications } from "../store/slices/applicationsSlice";
import type { Application } from "../types";
import Navbar from "../components/ui/Navbar";
import StatsBar from "../components/ui/StatsBar";
import KanbanBoard from "../components/kanban/KanbanBoard";
import ApplicationForm from "../components/kanban/ApplicationForm";
import ApplicationDetail from "../components/kanban/ApplicationDetail";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "detail"; app: Application }
  | { type: "edit"; app: Application };

export default function BoardPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error, items } = useAppSelector((s) => s.applications);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const closeModal = () => setModal({ type: "none" });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display font-bold text-2xl text-white">Application Board</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Track your job search journey
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(fetchApplications())}
                disabled={isLoading}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <FiRefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              <button
                onClick={() => setModal({ type: "create" })}
                className="btn-primary-custom text-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Application
              </button>
            </div>
          </div>
          <StatsBar />
        </div>

        {/* Board */}
        <div className="flex-1 overflow-hidden px-6 pt-5">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin" />
                </div>
                <p className="text-slate-400 text-sm">Loading your applications…</p>
              </div>
            </div>
          ) : items.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <div className="text-center">
                <p className="font-display font-semibold text-slate-200 text-lg">No applications yet</p>
                <p className="text-slate-500 text-sm mt-1">
                  Click &ldquo;Add Application&rdquo; to start tracking your job search
                </p>
              </div>
              <button
                onClick={() => setModal({ type: "create" })}
                className="btn-primary-custom"
              >
                <FiPlus className="w-4 h-4" />
                Add Your First Application
              </button>
            </div>
          ) : (
            <KanbanBoard
              onCardClick={(app) => setModal({ type: "detail", app })}
            />
          )}
        </div>
      </main>

      {/* Modals */}
      {modal.type === "create" && (
        <ApplicationForm onClose={closeModal} />
      )}

      {modal.type === "edit" && (
        <ApplicationForm
          application={modal.app}
          onClose={closeModal}
        />
      )}

      {modal.type === "detail" && (
        <ApplicationDetail
          application={modal.app}
          onClose={closeModal}
          onEdit={() => setModal({ type: "edit", app: modal.app })}
        />
      )}
    </div>
  );
}
