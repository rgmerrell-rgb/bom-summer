import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { usernameToEmail } from "@/lib/username";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = ((formData.get("username") as string) ?? "").trim().toLowerCase();
  const password = formData.get("password") as string;

  const email = usernameToEmail(username);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(error.message)}`, request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
}
