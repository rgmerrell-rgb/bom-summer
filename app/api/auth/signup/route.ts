import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { usernameToEmail } from "@/lib/username";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = ((formData.get("username") as string) ?? "").trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return NextResponse.redirect(
      new URL(`/auth/signup?error=${encodeURIComponent("Username and password are required.")}`, request.url),
      { status: 303 }
    );
  }

  const email = usernameToEmail(username);
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    const msg = error.message.toLowerCase().includes("already registered")
      ? "That username is already taken. Please choose another."
      : error.message;
    return NextResponse.redirect(
      new URL(`/auth/signup?error=${encodeURIComponent(msg)}`, request.url),
      { status: 303 }
    );
  }

  return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
}
