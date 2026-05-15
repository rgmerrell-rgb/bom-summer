"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export type SignupState = {
  error?: string;
} | null;

// Supabase Auth requires an email. We synthesize one from the username
// so users only need to remember their username, not an email address.
const USERNAME_DOMAIN = "bom.local";
export function usernameToEmail(username: string): string {
  return `${username.toLowerCase()}@${USERNAME_DOMAIN}`;
}

export async function signUpAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const fullName = (formData.get("full_name") as string).trim();
  const username = (formData.get("username")  as string).trim().toLowerCase();
  const password = (formData.get("password")  as string);
  const phone    = (formData.get("phone")     as string).trim() || null;

  if (!fullName || !username || !password) {
    return { error: "Please fill in all required fields." };
  }

  if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
    return { error: "Username must be 3–20 characters: letters, numbers, underscores, hyphens." };
  }

  const email = usernameToEmail(username);
  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username,
        phone,
      },
    },
  });

  if (authError) {
    // Supabase returns a generic "User already registered" message for duplicate
    // emails; surface a friendlier username-specific message instead.
    if (authError.message.toLowerCase().includes("already registered")) {
      return { error: "That username is already taken. Please choose another." };
    }
    return { error: authError.message };
  }

  redirect("/dashboard");
}
