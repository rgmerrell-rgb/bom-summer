"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { checkIn, saveReflection } from "./actions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReflectionEntry = {
  id:            string;
  check_in_date: string;
  notes:         string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
    year:    "numeric",
  }).format(new Date(iso + "T00:00:00"));
}

// ---------------------------------------------------------------------------
// Submit buttons — useFormStatus must live inside the <form>
// ---------------------------------------------------------------------------

function CheckInSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl py-5 text-lg font-semibold transition-opacity disabled:opacity-60"
      style={{ backgroundColor: "#1B3A5C", color: "#FFFFFF" }}
    >
      {pending ? "Saving…" : "Yes, I read today! 📖"}
    </button>
  );
}

function SaveReflectionButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-60"
      style={{ backgroundColor: "#1B3A5C", color: "#FFFFFF" }}
    >
      {pending ? "Saving…" : "Save reflection"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Editable reflection form
// ---------------------------------------------------------------------------

function ReflectionForm({ todayNote }: { todayNote: string | null }) {
  return (
    <form
      key={todayNote ?? "__empty__"}
      action={saveReflection}
      className="space-y-3"
    >
      <textarea
        name="note"
        rows={4}
        defaultValue={todayNote ?? ""}
        placeholder="Write anything…"
        className="w-full rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-0"
        style={{
          border: "1px solid #DDD5BB",
          color: "#2C2416",
          backgroundColor: "#FAFAF8",
          lineHeight: "1.6",
        }}
      />
      <div className="flex items-center gap-3">
        <SaveReflectionButton />
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Read-only view of today's reflection
// ---------------------------------------------------------------------------

function ReflectionReadOnly({
  note,
  onEdit,
}: {
  note: string;
  onEdit: () => void;
}) {
  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{ backgroundColor: "#F5F0E2", border: "1px solid #DDD5BB" }}
    >
      <p
        className="text-sm leading-relaxed whitespace-pre-wrap"
        style={{ color: "#2C2416" }}
      >
        {note}
      </p>
      <button
        onClick={onEdit}
        className="mt-2 text-xs hover:underline"
        style={{ color: "#6A6050" }}
      >
        Edit reflection
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scrollable past-reflections list
// ---------------------------------------------------------------------------

function PastReflections({ entries }: { entries: ReflectionEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div
      className="pt-4 mt-2"
      style={{ borderTop: "1px solid #DDD5BB" }}
    >
      <p
        className="mb-3 text-xs font-semibold uppercase tracking-wide"
        style={{ color: "#6A6050" }}
      >
        Previous reflections ({entries.length})
      </p>

      <div
        className="space-y-3 overflow-y-auto pr-1"
        style={{ maxHeight: "260px" }}
      >
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg px-4 py-3"
            style={{ backgroundColor: "#FAFAF8", border: "1px solid #DDD5BB" }}
          >
            <p
              className="mb-1.5 text-xs font-semibold"
              style={{ color: "#6A6050" }}
            >
              {formatDate(entry.check_in_date)}
            </p>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "#2C2416" }}
            >
              {entry.notes}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CheckInSection — main export
// ---------------------------------------------------------------------------

export function CheckInSection({
  alreadyRead,
  todayNote,
  pastReflections,
}: {
  alreadyRead:      boolean;
  todayNote:        string | null;
  pastReflections:  ReflectionEntry[];
}) {
  // Start in edit mode only if there is no saved note yet.
  const [isEditing, setIsEditing] = useState(!todayNote);

  // Sync back to read-only when todayNote arrives after a save (page revalidates).
  useEffect(() => {
    if (todayNote) setIsEditing(false);
  }, [todayNote]);

  return (
    <section
      className="rounded-xl bg-white p-6 space-y-4"
      style={{ border: "1px solid #DDD5BB" }}
    >
      {!alreadyRead ? (
        /* ── Not yet read today ─────────────────────────────────────── */
        <form action={checkIn}>
          <CheckInSubmitButton />
        </form>
      ) : (
        /* ── Already read today ─────────────────────────────────────── */
        <>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
            style={{ backgroundColor: "#D8F3DC", color: "#2D6A4F" }}
          >
            ✓ Read today
          </div>

          <div>
            <p className="text-sm font-medium" style={{ color: "#2C2416" }}>
              What stood out to you?{" "}
              <span className="font-normal" style={{ color: "#6A6050" }}>
                (optional)
              </span>
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "#6A6050" }}>
              A verse, a thought, something that resonated — just for you.
            </p>
          </div>

          {isEditing || !todayNote ? (
            <ReflectionForm todayNote={todayNote} />
          ) : (
            <ReflectionReadOnly
              note={todayNote}
              onEdit={() => setIsEditing(true)}
            />
          )}
        </>
      )}

      {/* Past reflections — shown whenever there are entries */}
      <PastReflections entries={pastReflections} />
    </section>
  );
}
