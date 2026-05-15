import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckInSection, type ReflectionEntry } from "./CheckInSection";
import { SummerProgress } from "./SummerProgress";
import { MilestoneBadges, type MilestoneWithStatus } from "./MilestoneBadges";
import { DashboardGreeting } from "./DashboardGreeting";

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function subtractDays(base: string, n: number): string {
  const d = new Date(base + "T00:00:00");
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function computeStreak(dateSet: Set<string>, today: string): number {
  let streak = 0;
  for (let i = 0; i <= 365; i++) {
    const d = i === 0 ? today : subtractDays(today, i);
    if (dateSet.has(d)) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  if (!user) redirect("/auth/login");

  const today = todayStr();

  const [
    { data: member },
    { data: rawCheckIns },
    { data: milestones },
    { data: earnedRows },
  ] = await Promise.all([
    db.from("members")
      .select("id, full_name")
      .eq("id", user.id)
      .single(),
    db.from("check_ins")
      .select("id, check_in_date, checked_in_at, notes")
      .eq("member_id", user.id)
      .order("check_in_date", { ascending: false }),
    db.from("milestones")
      .select("id, name, description, required_check_ins")
      .order("required_check_ins"),
    db.from("member_milestones")
      .select("milestone_id, earned_at")
      .eq("member_id", user.id),
  ]);

  // ── Derived sets ──────────────────────────────────────────────────────────

  type CheckInRow   = { id: string; check_in_date: string; checked_in_at: string; notes: string | null };
  type EarnedRow    = { milestone_id: string; earned_at: string };
  type MilestoneRow = { id: string; name: string; description: string; required_check_ins: number };

  const allCheckIns = (rawCheckIns ?? []) as CheckInRow[];

  const checkInDateSet = new Set<string>(allCheckIns.map((c) => c.check_in_date));

  const totalDaysRead    = checkInDateSet.size;
  const streak           = computeStreak(checkInDateSet, today);
  const alreadyCheckedIn = checkInDateSet.has(today);

  // Today's note (if the member checked in today and wrote a reflection)
  const todayNote = allCheckIns.find((c) => c.check_in_date === today)?.notes ?? null;

  // Past reflections: check-ins with notes, excluding today, newest first
  const reflectionEntries: ReflectionEntry[] = allCheckIns
    .filter((c) => c.notes && c.check_in_date !== today)
    .map((c) => ({ id: c.id, check_in_date: c.check_in_date, notes: c.notes! }));

  // ── Milestones ────────────────────────────────────────────────────────────

  const earnedMap = new Map<string, string>(
    ((earnedRows ?? []) as EarnedRow[]).map((r) => [r.milestone_id, r.earned_at])
  );

  const milestonesWithStatus: MilestoneWithStatus[] = ((milestones ?? []) as MilestoneRow[]).map((m) => ({
    id:                 m.id,
    name:               m.name,
    description:        m.description,
    required_check_ins: m.required_check_ins,
    earned:             earnedMap.has(m.id),
    earnedAt:           earnedMap.get(m.id) ?? null,
  }));

  // ── Render ────────────────────────────────────────────────────────────────

  const firstName = member?.full_name?.split(" ")[0] ?? "friend";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 space-y-8">

      {/* 1 ── Greeting */}
      <DashboardGreeting firstName={firstName} />

      {/* 2 ── Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-xl bg-white p-5"
          style={{ border: "1px solid #DDD5BB", borderLeft: "4px solid #D4A847" }}
        >
          <p className="text-3xl font-bold" style={{ color: "#1B3A5C" }}>{streak}</p>
          <p className="mt-1 text-sm font-medium" style={{ color: "#6A6050" }}>Day streak</p>
          <p className="text-lg">🔥</p>
        </div>
        <div
          className="rounded-xl bg-white p-5"
          style={{ border: "1px solid #DDD5BB", borderLeft: "4px solid #D4A847" }}
        >
          <p className="text-3xl font-bold" style={{ color: "#1B3A5C" }}>{totalDaysRead}</p>
          <p className="mt-1 text-sm font-medium" style={{ color: "#6A6050" }}>Total days read</p>
          <p className="text-lg">📖</p>
        </div>
      </div>

      {/* 3 ── Daily check-in + reflection */}
      <CheckInSection
        alreadyRead={alreadyCheckedIn}
        todayNote={todayNote}
        pastReflections={reflectionEntries}
      />

      {/* 4 ── Summer challenge progress */}
      <SummerProgress today={today} />

      {/* 5 ── Milestones */}
      {milestonesWithStatus.length > 0 && (
        <MilestoneBadges
          milestones={milestonesWithStatus}
          totalCheckIns={totalDaysRead}
        />
      )}

    </div>
  );
}
