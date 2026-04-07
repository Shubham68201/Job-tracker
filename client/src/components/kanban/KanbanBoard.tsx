import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  moveApplication,
  reorderApplications,
} from "../../store/slices/applicationsSlice";
import { applicationsApi } from "../../services/api";
import type { Application, ApplicationStatus } from "../../types";
import { KANBAN_COLUMNS } from "../../types";
import KanbanColumn from "./KanbanColumn";
import ApplicationCard from "./ApplicationCard";

interface Props {
  onCardClick: (app: Application) => void;
}

export default function KanbanBoard({ onCardClick }: Props) {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s) => s.applications);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getColumnApps = useCallback(
    (status: ApplicationStatus) =>
      items
        .filter((a) => a.status === status)
        .sort((a, b) => a.order - b.order),
    [items]
  );

  const activeApp = activeId ? items.find((a) => a._id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeApp = items.find((a) => a._id === active.id);
    if (!activeApp) return;

    // Dragging over a column
    const overStatus = KANBAN_COLUMNS.find((col) => col === over.id);
    if (overStatus && activeApp.status !== overStatus) {
      dispatch(moveApplication({ id: activeApp._id, newStatus: overStatus, newOrder: 0 }));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeAppItem = items.find((a) => a._id === active.id);
    if (!activeAppItem) return;

    // Dropped on a column header
    const overStatus = KANBAN_COLUMNS.find((col) => col === over.id);
    if (overStatus) {
      const colApps = getColumnApps(overStatus);
      const updates = colApps.map((a, i) => ({
        id: a._id,
        status: a.status,
        order: i,
      }));
      await applicationsApi.updateOrder(updates);
      return;
    }

    // Dropped on another card
    const overApp = items.find((a) => a._id === over.id);
    if (!overApp) return;

    if (activeAppItem.status === overApp.status) {
      // Reorder within same column
      const colApps = getColumnApps(activeAppItem.status);
      const oldIdx = colApps.findIndex((a) => a._id === active.id);
      const newIdx = colApps.findIndex((a) => a._id === over.id);
      const reordered = arrayMove(colApps, oldIdx, newIdx);

      const updatedItems = items.map((item) => {
        const newOrder = reordered.findIndex((r) => r._id === item._id);
        if (newOrder !== -1) return { ...item, order: newOrder };
        return item;
      });
      dispatch(reorderApplications(updatedItems));

      await applicationsApi.updateOrder(
        reordered.map((a, i) => ({ id: a._id, status: a.status, order: i }))
      );
    } else {
      // Move to new column
      dispatch(moveApplication({
        id: activeAppItem._id,
        newStatus: overApp.status,
        newOrder: overApp.order,
      }));
      const colApps = getColumnApps(overApp.status);
      await applicationsApi.updateOrder(
        colApps.map((a, i) => ({ id: a._id, status: a.status, order: i }))
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full pb-4 overflow-x-auto overflow-y-hidden scrollbar-thin px-1">
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={getColumnApps(status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp ? (
          <div className="drag-overlay">
            <ApplicationCard
              application={activeApp}
              onClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
