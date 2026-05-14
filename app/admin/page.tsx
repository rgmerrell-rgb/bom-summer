import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { redirect } from "next/navigation";
import { ResetButton } from "./ResetButton";

export const metadata = { title: "Admin — Book of Mormon Summer" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function todayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  }).format(new Date(iso));
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MemberRow = {
  id:                  string;
  email:               string;
  full_name:           string | null;
  role:                string;
  reminder_time:       string | null;
  reminder_preference: string | null;
  created_at:          string;
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function AdminPage() {
  // ── Auth + admin gate ─────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authDb = (await createClient()) as any;
  const { data: { user } } = await authDb.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: callerMember } = await authDb
    .from("members")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerMember?.role !== "admin") redirect("/dashboard");

  // ── Data fetch ────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const service = createServiceClient() as any;
  const today   = todayUTC();

  const [
    { data: members },
    { data: allCheckIns },
    { data: allMemberMilestones },
    { data: milestones },
  ] = await Promise.all([
    service
      .from("members")
      .select("id, email, full_name, role, reminder_time, reminder_preference, created_at")
      .order("created_at"),
    service
      .from("check_ins")
      .select("member_id, checked_in_at"),
    service
      .from("member_milestones")
      .select("member_id"),
    service
      .from("milestones")
      .select("id"),
  ]);

  // ── Build per-member stats ────────────────────────────────────────────────

  const checkInsByMember = new Map<string, string[]>();
  for (const ci of (allCheckIns ?? [])) {
    if (!checkInsByMember.has(ci.member_id)) {
      checkInsByMember.set(ci.member_id, []);
    }
    checkInsByMember.get(ci.member_id)!.push(ci.checked_in_at.slice(0, 10));
  }

  const milestoneCountByMember = new Map<string, number>();
  for (const mm of (allMemberMilestones ?? [])) {
    milestoneCountByMember.set(
      mm.member_id,
      (milestoneCountByMember.get(mm.member_id) ?? 0) + 1
    );
  }

  const totalMilestones = milestones?.length ?? 0;

  type MemberStat = MemberRow & {
    totalDays:        number;
    readToday:        boolean;
    lastRead:         string | null;
    milestonesEarned: number;
  };

  const memberStats: MemberStat[] = (members ?? []).map((m: MemberRow) => {
    const dates      = [...new Set(checkInsByMember.get(m.id) ?? [])].sort().reverse();
    const readToday  = dates.includes(today);
    const lastRead   = dates[0] ?? null;
    const totalDays  = dates.length;
    const milestonesEarned = milestoneCountByMember.get(m.id) ?? 0;
    return { ...m, totalDays, readToday, lastRead, milestonesEarned };
  });

  const readTodayCount = memberStats.filter((m) => m.readToday).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#2C2416" }}>Admin</h1>
        <p className="mt-1 text-sm" style={{ color: "#6A6050" }}>
          {memberStats.length} {memberStats.length === 1 ? "member" : "members"} &nbsp;·&nbsp;
          {readTodayCount} read today
        </p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total members",  value: memberStats.length,                              emoji: "👥" },
          { label: "Read today",     value: readTodayCount,                                  emoji: "✅" },
          { label: "Never read",     value: memberStats.filter((m) => m.totalDays === 0).length, emoji: "💤" },
          { label: "Total check-ins",value: allCheckIns?.length ?? 0,                        emoji: "📖" },
        ].map(({ label, value, emoji }) => (
          <div
            key={label}
            className="rounded-xl bg-white p-4"
            style={{ border: "1px solid #DDD5BB", borderTop: "4px solid #D4A847" }}
          >
            <p className="text-2xl font-bold" style={{ color: "#1B3A5C" }}>{value}</p>
            <p className="mt-0.5 text-xs font-medium" style={{ color: "#6A6050" }}>{label} {emoji}</p>
          </div>
        ))}
      </div>

      {/* Member table */}
      <div
        className="overflow-x-auto rounded-xl bg-white"
        style={{ border: "1px solid #DDD5BB" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: "#F5F0E2", borderBottom: "1px solid #DDD5BB" }}>
              {["Member", "Days read", "Last read", "Today", "Milestones", "Actions"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                  style={{ color: "#6A6050" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {memberStats.map((m, i) => (
              <tr
                key={m.id}
                style={{
                  borderBottom: i < memberStats.length - 1 ? "1px solid #DDD5BB" : undefined,
                }}
              >
                {/* Member name + email */}
                <td className="px-4 py-3">
                  <p className="font-medium" style={{ color: "#2C2416" }}>
                    {m.full_name ?? "—"}
                    {m.role === "admin" && (
                      <span
                        className="ml-2 rounded-full px-1.5 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: "#EDD98A", color: "#2C2416" }}
                      >
                        admin
                      </span>
                    )}
                  </p>
                  <p className="text-xs" style={{ color: "#6A6050" }}>{m.email}</p>
                </td>

                {/* Total days */}
                <td className="px-4 py-3 font-semibold tabular-nums" style={{ color: "#1B3A5C" }}>
                  {m.totalDays}
                </td>

                {/* Last read */}
                <td className="px-4 py-3" style={{ color: "#6A6050" }}>
                  {m.lastRead ? formatDate(m.lastRead) : "—"}
                </td>

                {/* Read today badge */}
                <td className="px-4 py-3">
                  {m.readToday ? (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: "#D8F3DC", color: "#2D6A4F" }}
                    >
                      ✓ Read
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: "#F5F0E2", color: "#6A6050" }}
                    >
                      Not yet
                    </span>
                  )}
                </td>

                {/* Milestones */}
                <td className="px-4 py-3 tabular-nums" style={{ color: "#6A6050" }}>
                  {m.milestonesEarned} / {totalMilestones}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  {m.readToday && (
                    <ResetButton
                      memberId={m.id}
                      memberName={m.full_name ?? m.email}
                    />
                  )}
                </td>
              </tr>
            ))}

            {memberStats.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm"
                  style={{ color: "#6A6050" }}
                >
                  No members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
