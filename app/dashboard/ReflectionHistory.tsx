export type ReflectionEntry = {
  id:            string;
  checked_in_at: string;
  notes:         string;
};

function formatEntryDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
  }).format(new Date(iso));
}

export function ReflectionHistory({ entries }: { entries: ReflectionEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold" style={{ color: "#2C2416" }}>
        Past Reflections{" "}
        <span className="text-sm font-normal" style={{ color: "#6A6050" }}>
          — {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </span>
      </h2>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-xl bg-white p-4"
            style={{ border: "1px solid #DDD5BB" }}
          >
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#6A6050" }}
            >
              {formatEntryDate(entry.checked_in_at)}
            </p>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "#2C2416" }}
            >
              {entry.notes}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
