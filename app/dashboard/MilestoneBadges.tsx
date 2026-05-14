import { cn } from "@/lib/utils";

export type MilestoneWithStatus = {
  id: string;
  name: string;
  description: string;
  required_check_ins: number;
  earned: boolean;
  earnedAt: string | null;
};

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

const BADGE_EMOJI: Record<string, string> = {
  "First Step":    "⚡",
  "One Week":      "🔥",
  "One Month":     "📖",
  "Halfway There": "🌟",
  "Summer Scholar":"🏆",
};

function getBadge(name: string) {
  return BADGE_EMOJI[name] ?? "🏅";
}

export function MilestoneBadges({
  milestones,
  totalCheckIns,
}: {
  milestones: MilestoneWithStatus[];
  totalCheckIns: number;
}) {
  const earnedCount = milestones.filter((m) => m.earned).length;

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-bom-text">Milestones</h2>
        <span className="text-sm text-bom-muted">
          {earnedCount} / {milestones.length} earned
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="rounded-xl p-4 transition-colors"
            style={
              m.earned
                ? { backgroundColor: "#EDD98A", border: "1px solid #D4A847" }
                : { backgroundColor: "#FFFFFF", border: "1px solid #DDD5BB" }
            }
          >
            <div
              className="mb-2 text-2xl"
              style={!m.earned ? { filter: "grayscale(100%)", opacity: 0.4 } : undefined}
            >
              {getBadge(m.name)}
            </div>

            <p className={cn(
              "text-sm font-semibold leading-snug",
              m.earned ? "text-bom-text" : "text-bom-muted"
            )}>
              {m.name}
            </p>

            <p className={cn(
              "mt-0.5 text-xs leading-snug",
              m.earned ? "text-bom-muted" : "text-bom-muted/70"
            )}>
              {m.description}
            </p>

            <p className="mt-2 text-xs font-medium">
              {m.earned ? (
                <span className="text-bom-navy">
                  Earned {formatShortDate(m.earnedAt!)}
                </span>
              ) : (
                <span className="text-bom-muted">
                  {Math.min(totalCheckIns, m.required_check_ins)}&nbsp;/&nbsp;
                  {m.required_check_ins} days
                </span>
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
