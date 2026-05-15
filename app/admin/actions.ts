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

// Wipe all member_milestones for a member and re-award based on current check-in count.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncMilestones(service: any, memberId: string) {
  await service
    .from("member_milestones")
    .delete()
    .eq("member_id", memberId);

  const { count: remainingCount } = await service
    .from("check_ins")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId);

  if (remainingCount && remainingCount > 0) {
    const { data: allMilestones } = await service
      .from("milestones")
      .select("id, required_check_ins");

    const toAward = (allMilestones ?? []).filter(
      (m: { id: string; required_check_ins: number }) =>
        m.required_check_ins <= (remainingCount ?? 0)
    );

    for (const m of toAward) {
      await service
        .from("member_milestones")
        .insert({ member_id: memberId, milestone_id: m.id });
    }
  }
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

  await syncMilestones(service, memberId);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}

// Recalculate milestones for a member without touching their check-ins.
export async function recalculateMilestones(formData: FormData) {
  const admin = await assertAdmin();
  if (!admin) return;

  const memberId = formData.get("memberId") as string;
  if (!memberId) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = createServiceClient() as any;

  await syncMilestones(service, memberId);

  revalidatePath("/admin");
  revalidatePath("/dashboard");
}
