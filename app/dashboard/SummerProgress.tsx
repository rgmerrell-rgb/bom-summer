// Challenge window: June 1 – August 31 (92 days total).
const CHALLENGE_START = "2026-06-01";
const CHALLENGE_END   = "2026-08-31";
const TOTAL_DAYS      = 92;

function challengeProgress(today: string): {
  dayNumber: number;
  percent: number;
  status: "before" | "active" | "complete";
} {
  if (today < CHALLENGE_START) {
    return { dayNumber: 0, percent: 0, status: "before" };
  }
  if (today > CHALLENGE_END) {
    return { dayNumber: TOTAL_DAYS, percent: 100, status: "complete" };
  }
  const start     = new Date(CHALLENGE_START + "T00:00:00");
  const current   = new Date(today           + "T00:00:00");
  const elapsed   = Math.round((current.getTime() - start.getTime()) / 86_400_000) + 1;
  const dayNumber = Math.min(elapsed, TOTAL_DAYS);
  return {
    dayNumber,
    percent: Math.round((dayNumber / TOTAL_DAYS) * 100),
    status:  "active",
  };
}

export function SummerProgress({ today }: { today: string }) {
  const { dayNumber, percent, status } = challengeProgress(today);

  const subtext =
    status === "before"   ? "Challenge begins June 1, 2026"
    : status === "complete" ? "Challenge complete — well done!"
    : `Day ${dayNumber} of ${TOTAL_DAYS} · ${TOTAL_DAYS - dayNumber} days remaining`;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold" style={{ color: "#2C2416" }}>
        Summer in the Book of Mormon Progress
      </h2>

      <div
        className="rounded-xl bg-white p-5 space-y-3"
        style={{ border: "1px solid #DDD5BB" }}
      >
        {/* Progress bar */}
        <div
          style={{
            height:       "18px",
            borderRadius: "9999px",
            backgroundColor: "#EDE6D0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height:       "100%",
              width:        `${percent}%`,
              borderRadius: "9999px",
              backgroundColor: "#1B3A5C",
              transition:   "width 0.4s ease",
              minWidth:     percent > 0 ? "18px" : "0",
            }}
          />
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between text-sm">
          <span style={{ color: "#6A6050" }}>{subtext}</span>
          <span className="font-semibold tabular-nums" style={{ color: "#1B3A5C" }}>
            {percent}%
          </span>
        </div>
      </div>
    </section>
  );
}
