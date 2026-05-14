"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// awardMilestones
// Uses the service-role client to bypass the admin-only RLS insert policy on
// member_milestones. Called immediately after every successful check-in.
// console.log output appears in the terminal running `npm run dev`.
// ---------------------------------------------------------------------------
async function awardMilestones(memberId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = createServiceClient() as any;

  console.log(`[milestones] counting check-ins for member ${memberId}`);
  const { count, error: countError } = await service
    .from("check_ins")
    .select("*", { count: "exact", head: true })
    .eq("member_id", memberId);

  if (countError) {
    console.error("[milestones] failed to count check-ins:", countError.message);
    return;
  }
  if (count === null) {
    console.error("[milestones] count returned null");
    return;
  }
  console.log(`[milestones] total check-ins: ${count}`);

  const { data: milestones, error: milestonesError } = await service
    .from("milestones")
    .select("id, name, required_check_ins");

  if (milestonesError) {
    console.error("[milestones] failed to fetch milestones:", milestonesError.message);
    return;
  }
  console.log(`[milestones] ${milestones.length} milestones found`);

  const { data: earned, error: earnedError } = await service
    .from("member_milestones")
    .select("milestone_id")
    .eq("member_id", memberId);

  if (earnedError) {
    console.error("[milestones] failed to fetch earned milestones:", earnedError.message);
    return;
  }
  const earnedIds = new Set((earned ?? []).map((r: { milestone_id: string }) => r.milestone_id));
  console.log(`[milestones] already earned: ${earnedIds.size}`);

  for (const milestone of milestones) {
    if (milestone.required_check_ins <= count && !earnedIds.has(milestone.id)) {
      console.log(`[milestones] awarding "${milestone.name}" (requires ${milestone.required_check_ins})`);
      const { error: insertError } = await service
        .from("member_milestones")
        .insert({ member_id: memberId, milestone_id: milestone.id });
      if (insertError) {
        console.error(`[milestones] failed to award "${milestone.name}":`, insertError.message);
      } else {
        console.log(`[milestones] awarded "${milestone.name}" ✓`);
      }
    }
  }

  console.log("[milestones] done");
}

// ---------------------------------------------------------------------------
// saveReflection — updates today's check-in with a reflection note
// ---------------------------------------------------------------------------
export async function saveReflection(formData: FormData) {
  const note = ((formData.get("note") as string) ?? "").trim() || null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (await createClient()) as any;

  const { data: { user } } = await db.auth.getUser();
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];

  const { error } = await db
    .from("check_ins")
    .update({ notes: note })
    .eq("member_id", user.id)
    .eq("check_in_date", today);

  if (error) {
    console.error("saveReflection error:", error.message);
  }

  revalidatePath("/dashboard");
}

// ---------------------------------------------------------------------------
// checkIn — server action called from CheckInSection
// memberId is derived from the authenticated session, never from the client.
// ---------------------------------------------------------------------------
export async function checkIn() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (await createClient()) as any;

  const { data: { user } } = await db.auth.getUser();
  if (!user) return;

  const { error } = await db
    .from("check_ins")
    .insert({ member_id: user.id });

  if (error) {
    // Unique index violation — already checked in today, safe to ignore.
    if (!error.code?.includes("23505")) {
      console.error("check-in insert error:", error.message);
    }
    return;
  }

  await awardMilestones(user.id);

  revalidatePath("/dashboard");
}
