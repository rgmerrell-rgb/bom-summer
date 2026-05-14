"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

// Verify the calling user is an admin. Returns the user or null.
async function assertAdmin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (await createClient()) as any;
  const { data: { user } } = await db.auth.getUser();
  if (!user) return null;

  const { data: member } = await db
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  return member?.role === "admin" ? user : null;
}

// Delete today's check-in for the given member (UTC date).
export async function resetTodayCheckIn(formData: FormData) {
  const admin = await assertAdmin();
  if (!admin) return;

  const memberId = formData.get("memberId") as string;
  if (!memberId) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = createServiceClient() as any;

  const today = new Date().toISOString().split("T")[0];

  const { error } = await service
    .from("check_ins")
    .delete()
    .eq("member_id", memberId)
    .eq("check_in_date", today);

  if (error) {
    console.error("[admin] resetTodayCheckIn error:", error.message);
  }

  revalidatePath("/admin");
}
