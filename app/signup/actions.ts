"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/welcome";
import { redirect } from "next/navigation";

export type SignupState = {
  error?: string;
} | null;

export async function signUpAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const fullName  = (formData.get("full_name")           as string).trim();
  const email     = (formData.get("email")                as string).trim();
  const password  = (formData.get("password")             as string);
  const phone     = (formData.get("phone")                as string).trim() || null;
  const remTime   = (formData.get("reminder_time")        as string);
  const remPref   = (formData.get("reminder_preference")  as string);

  if (!fullName || !email || !password || !remTime || !remPref) {
    return { error: "Please fill in all required fields." };
  }

  const supabase = await createClient();

  // Pass all profile fields as metadata so the DB trigger can populate the
  // members row atomically on insert.
  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name:           fullName,
        phone,
        reminder_time:       remTime,
        reminder_preference: remPref,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Fire-and-forget — a Resend failure shouldn't block the user.
  try {
    await sendWelcomeEmail({ to: email, fullName });
  } catch (err) {
    console.error("Welcome email failed:", err);
  }

  redirect("/dashboard");
}
