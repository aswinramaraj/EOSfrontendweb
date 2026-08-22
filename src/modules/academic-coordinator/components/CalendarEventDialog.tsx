"use client";

import { useState } from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { pageButtonStyle } from "@/modules/placement/lib/pageButtonStyle";
import { useToast } from "@/shared/components/ui/ToastProvider";
import { ApiError } from "@/shared/lib/api-client";
import { fieldErrorStyle, fieldInputStyle, fieldLabelStyle, fieldRowStyle, dialogFooterStyle } from "@/modules/academic-structure/lib/formStyles";
import { useCreateCalendarEvent, useDeleteCalendarEvent, useUpdateCalendarEvent } from "../hooks/useAcademicCalendarMutations";
import type { CalendarEventItem, CalendarEventType } from "../types";

interface CalendarEventDialogProps {
  open: boolean;
  onClose: () => void;
  academicCalendarId: number;
  /** Pre-fills the date when creating a new event from a clicked calendar cell. */
  defaultDate?: string;
  event: CalendarEventItem | null;
}

export function CalendarEventDialog({ open, onClose, academicCalendarId, defaultDate, event }: CalendarEventDialogProps) {
  const { show } = useToast();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();

  const [title, setTitle] = useState(event?.title ?? "");
  const [description, setDescription] = useState(event?.description ?? "");
  const [eventDate, setEventDate] = useState(event?.eventDate.slice(0, 10) ?? defaultDate ?? "");
  const [eventType, setEventType] = useState<CalendarEventType>(event?.eventType ?? "event");
  const [startTime, setStartTime] = useState(event?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(event?.endTime ?? "17:00");
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isEdit = event != null;
  const isPending = createEvent.isPending || updateEvent.isPending;

  function handleSave() {
    setError(null);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return setError("Title is required.");
    if (!eventDate) return setError("Event date is required.");
    if (endTime <= startTime) return setError("End time must be after start time.");

    const base = { title: trimmedTitle, description: description.trim() || undefined, event_date: eventDate, event_type: eventType, start_time: startTime, end_time: endTime };

    (isEdit
      ? updateEvent.mutateAsync({ id: event.id, academicCalendarId, input: base })
      : createEvent.mutateAsync({ academic_calendar_id: academicCalendarId, ...base }))
      .then(() => {
        show(isEdit ? "Event updated" : "Event added", "success");
        onClose();
      })
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again."));
  }

  function handleDelete() {
    if (!event) return;
    deleteEvent
      .mutateAsync({ id: event.id, academicCalendarId })
      .then(() => {
        show("Event deleted", "success");
        onClose();
      })
      .catch((err: unknown) => {
        show(err instanceof ApiError ? err.message : "Something went wrong.", "error");
        setConfirmingDelete(false);
      });
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title={isEdit ? "Edit event" : "New calendar event"} widthClassName="max-w-md">
        <div style={fieldRowStyle}>
          <label style={fieldLabelStyle}>Title *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} style={fieldInputStyle()} />
        </div>
        <div style={fieldRowStyle}>
          <label style={fieldLabelStyle}>Description</label>
          <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={255} style={fieldInputStyle()} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ ...fieldRowStyle, flex: 1 }}>
            <label style={fieldLabelStyle}>Date *</label>
            <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} style={fieldInputStyle()} />
          </div>
          <div style={{ ...fieldRowStyle, flex: 1 }}>
            <label style={fieldLabelStyle}>Type *</label>
            <select value={eventType} onChange={(e) => setEventType(e.target.value as CalendarEventType)} style={fieldInputStyle()}>
              <option value="event">Event</option>
              <option value="holiday">Holiday</option>
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ ...fieldRowStyle, flex: 1 }}>
            <label style={fieldLabelStyle}>Start time *</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={fieldInputStyle()} />
          </div>
          <div style={{ ...fieldRowStyle, flex: 1 }}>
            <label style={fieldLabelStyle}>End time *</label>
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={fieldInputStyle()} />
          </div>
        </div>

        {error && <p style={fieldErrorStyle}>{error}</p>}

        <div style={{ ...dialogFooterStyle, justifyContent: isEdit ? "space-between" : "flex-end" }}>
          {isEdit && (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              disabled={deleteEvent.isPending}
              style={{ ...pageButtonStyle(false), borderColor: "#fecaca", color: "#b91c1c" }}
            >
              {deleteEvent.isPending ? "Deleting…" : "Delete"}
            </button>
          )}
          <div style={{ display: "flex", gap: 9 }}>
            <button type="button" style={pageButtonStyle(false)} onClick={onClose} disabled={isPending}>
              Cancel
            </button>
            <button type="button" style={pageButtonStyle(true)} onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Save changes" : "Add event"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete this event?"
        message="This removes it from the published calendar immediately."
        confirmLabel="Delete"
        tone="danger"
        isPending={deleteEvent.isPending}
        onConfirm={handleDelete}
        onClose={() => setConfirmingDelete(false)}
      />
    </>
  );
}
