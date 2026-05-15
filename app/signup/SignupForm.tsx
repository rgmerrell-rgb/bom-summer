"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signUpAction, type SignupState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl py-3 text-sm font-semibold transition-opacity disabled:opacity-60"
      style={{ backgroundColor: "#1B3A5C", color: "#FFFFFF" }}
    >
      {pending ? "Creating your account…" : "Create my account"}
    </button>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: "#2C2416" }}>
        {label}
        {!required && (
          <span className="ml-1 font-normal" style={{ color: "#6A6050" }}>(optional)</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-colors";
const inputStyle = {
  border: "1px solid #DDD5BB",
  color: "#2C2416",
  backgroundColor: "#FFFFFF",
};

export default function SignupForm() {
  const [state, action] = useFormState<SignupState, FormData>(signUpAction, null);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Field label="Display name" required>
        <input
          name="full_name"
          type="text"
          required
          autoComplete="name"
          placeholder="Jane"
          className={inputClass}
          style={inputStyle}
        />
      </Field>

      <Field label="Username" required>
        <input
          name="username"
          type="text"
          required
          autoComplete="username"
          placeholder="jane_smith"
          pattern="[a-zA-Z0-9_\-]{3,20}"
          title="3–20 characters: letters, numbers, underscores, hyphens"
          className={inputClass}
          style={inputStyle}
        />
      </Field>

      <Field label="Password" required>
        <input
          name="password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          placeholder="At least 8 characters"
          className={inputClass}
          style={inputStyle}
        />
      </Field>

      <Field label="Phone number (for SMS reminders)">
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+1 (555) 000-0000"
          className={inputClass}
          style={inputStyle}
        />
      </Field>

      <SubmitButton />

      <p className="text-center text-sm" style={{ color: "#6A6050" }}>
        Already have an account?{" "}
        <a href="/auth/login" className="font-medium hover:underline" style={{ color: "#1B3A5C" }}>
          Sign in
        </a>
      </p>
    </form>
  );
}
