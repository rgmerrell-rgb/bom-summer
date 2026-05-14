import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { generateEncouragement } from "@/lib/anthropic";
import { sendReminderEmail } from "@/lib/email/reminder";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns the zero-padded UTC hour, e.g. "08" or "14". */
function currentUTCHour(): string {
  return String(new Date().getUTCHours()).padStart(2, "0");
}

function todayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MemberRow = {
  id:        string;
  email:     string;
  full_name: string | null;
};

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServiceClient() as any;
  const hour     = currentUTCHour();
  const today    = todayUTC();

  // Match members whose reminder_time falls in the current UTC hour.
  // reminder_time is stored as PostgreSQL TIME ("HH:MM:SS").
  const lo = `${hour}:00:00`;
  const hi = `${hour}:59:59`;

  const { data: members, error } = await supabase
    .from("members")
    .select("id, email, full_name")
    .gte("reminder_time", lo)
    .lte("reminder_time", hi)
    .in("reminder_preference", ["email", "both"]);

  if (error) {
    console.error("[cron/send-reminders] DB error:", error);
    return NextResponse.json({ error: "DB query failed" }, { status: 500 });
  }

  if (!members?.length) {
    return NextResponse.json({ sent: 0, skipped: 0, failed: 0, hour });
  }

  // Process concurrently; never let one failure abort others.
  const results = await Promise.allSettled(
    (members as MemberRow[]).map(async (member) => {
      const firstName = member.full_name?.split(" ")[0] ?? "friend";

      // Fetch total check-in count and whether they already read today.
      const { data: checkIns } = await supabase
        .from("check_ins")
        .select("check_in_date")
        .eq("member_id", member.id);

      const dateSet       = new Set<string>((checkIns ?? []).map((c: { check_in_date: string }) => c.check_in_date));
      const totalDaysRead = dateSet.size;

      // Skip if they've already checked in today.
      if (dateSet.has(today)) return "already-read";

      // Compute streak from yesterday backwards.
      let streak = 0;
      const cursor = new Date(today + "T00:00:00Z");
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      for (let i = 0; i <= 365; i++) {
        const d = cursor.toISOString().split("T")[0];
        if (dateSet.has(d)) {
          streak++;
          cursor.setUTCDate(cursor.getUTCDate() - 1);
        } else {
          break;
        }
      }

      const encouragement = await generateEncouragement({ firstName, totalDaysRead, streak });

      await sendReminderEmail({ to: member.email, firstName, totalDaysRead, streak, encouragement });

      return "sent";
    })
  );

  const counts = { sent: 0, skipped: 0, failed: 0 };
  for (const r of results) {
    if (r.status === "rejected") {
      counts.failed++;
      console.error("[cron/send-reminders] member error:", r.reason);
    } else if (r.value === "sent") {
      counts.sent++;
    } else {
      counts.skipped++;
    }
  }

  console.log(`[cron/send-reminders] hour=${hour} today=${today}`, counts);
  return NextResponse.json({ ...counts, hour, today });
}
