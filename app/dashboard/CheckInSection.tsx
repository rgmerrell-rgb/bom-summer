"use client";

import { useFormStatus } from "react-dom";
import { checkIn, saveReflection } from "./actions";

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
// Reflection form — shown when the member has already read today
// key=todayNote forces remount after a save so the textarea reflects the
// latest saved value rather than stale uncontrolled input state.
// ---------------------------------------------------------------------------

function ReflectionForm({ todayNote }: { todayNote: string | null }) {
  return (
    <form key={todayNote ?? "__empty__"} action={saveReflection} className="space-y-3">
      <div>
        <label
          htmlFor="reflection-note"
          className="block text-sm font-medium"
          style={{ color: "#2C2416" }}
        >
          What stood out to you?{" "}
          <span className="font-normal" style={{ color: "#6A6050" }}>
            (optional)
          </span>
        </label>
        <p className="mt-0.5 text-xs" style={{ color: "#6A6050" }}>
          A verse, a thought, something that resonated — just for you.
        </p>
      </div>

      <textarea
        id="reflection-note"
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
        {todayNote && (
          <span className="text-xs" style={{ color: "#2D6A4F" }}>
            ✓ Reflection saved
          </span>
        )}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// CheckInSection — the main export used by dashboard/page.tsx
// ---------------------------------------------------------------------------

export function CheckInSection({
  alreadyRead,
  todayNote,
}: {
  alreadyRead: boolean;
  todayNote: string | null;
}) {
  return (
    <section
      className="rounded-xl bg-white p-6 space-y-4"
      style={{ border: "1px solid #DDD5BB" }}
    >
      {!alreadyRead ? (
        /* ── Not yet read today ───────────────────────────────────────── */
        <form action={checkIn}>
          <CheckInSubmitButton />
        </form>
      ) : (
        /* ── Already read today ──────────────────────────────────────── */
        <>
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
            style={{ backgroundColor: "#D8F3DC", color: "#2D6A4F" }}
          >
            ✓ Read today
          </div>
          <ReflectionForm todayNote={todayNote} />
        </>
      )}
    </section>
  );
}
