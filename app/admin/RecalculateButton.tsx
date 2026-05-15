"use client";

import { useFormStatus } from "react-dom";
import { recalculateMilestones } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md px-3 py-1.5 text-xs font-semibold transition-opacity disabled:opacity-50 hover:opacity-80"
      style={{ backgroundColor: "#6A6050", color: "#FFFFFF" }}
    >
      {pending ? "Recalculating…" : "Recalc milestones"}
    </button>
  );
}

export function RecalculateButton({
  memberId,
  memberName,
}: {
  memberId:   string;
  memberName: string;
}) {
  return (
    <form
      action={recalculateMilestones}
      onSubmit={(e) => {
        if (!confirm(`Recalculate milestones for ${memberName}?`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="memberId" value={memberId} />
      <SubmitButton />
    </form>
  );
}
