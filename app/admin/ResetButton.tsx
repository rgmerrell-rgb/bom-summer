"use client";

import { useFormStatus } from "react-dom";
import { resetTodayCheckIn } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md px-3 py-1.5 text-xs font-semibold transition-opacity disabled:opacity-50 hover:opacity-80"
      style={{ backgroundColor: "#1B3A5C", color: "#FFFFFF" }}
    >
      {pending ? "Resetting…" : "Reset today"}
    </button>
  );
}

export function ResetButton({
  memberId,
  memberName,
}: {
  memberId:   string;
  memberName: string;
}) {
  return (
    <form
      action={resetTodayCheckIn}
      onSubmit={(e) => {
        if (!confirm(`Reset today's check-in for ${memberName}?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="memberId" value={memberId} />
      <SubmitButton />
    </form>
  );
}
