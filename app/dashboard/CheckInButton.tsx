"use client";

import { useFormStatus } from "react-dom";
import { checkIn } from "./actions";

function SubmitButton({ alreadyRead }: { alreadyRead: boolean }) {
  const { pending } = useFormStatus();

  if (alreadyRead) {
    return (
      <button
        disabled
        className="w-full rounded-xl py-5 text-lg font-semibold cursor-default select-none"
        style={{ backgroundColor: "#F5F0E2", color: "#6A6050", border: "1px solid #DDD5BB" }}
      >
        ✓ Already read today
      </button>
    );
  }

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

export function CheckInButton({ alreadyRead }: { alreadyRead: boolean }) {
  return (
    <form action={checkIn}>
      <SubmitButton alreadyRead={alreadyRead} />
    </form>
  );
}
