import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./UserMenu";

export default async function Navbar() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: { user } } = await db.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: member } = await db
      .from("members")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = member?.role === "admin";
  }

  return (
    <nav style={{ backgroundColor: "#1B3A5C", borderBottom: "1px solid #122740" }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight"
          style={{ color: "#FFFFFF" }}
        >
          Book of Mormon Summer
        </Link>

        <UserMenu initialEmail={user?.email ?? null} isAdmin={isAdmin} />
      </div>
    </nav>
  );
}
