export type CalendarDay = {
  dateStr: string;
  label: string;
  isToday: boolean;
  hasCheckIn: boolean;
  isFuture: boolean;
};

export function ActivityCalendar({ days }: { days: CalendarDay[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold" style={{ color: "#2C2416" }}>
        Activity{" "}
        <span className="text-sm font-normal" style={{ color: "#6A6050" }}>
          — last 28 days
        </span>
      </h2>

      <div
        className="rounded-xl bg-white p-4"
        style={{ border: "1px solid #DDD5BB" }}
      >
        {/* 28-cell activity grid — oldest to newest, left to right */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "12px",
          }}
        >
          {days.map((day) => {
            let cellStyle: React.CSSProperties = {
              width: "100%",
              height: "40px",
              borderRadius: "4px",
            };

            if (day.hasCheckIn && day.isToday) {
              // Checked in today — navy fill + gold border
              cellStyle = { ...cellStyle, backgroundColor: "#1B3A5C", border: "2px solid #D4A847" };
            } else if (day.hasCheckIn) {
              // Checked in on a past day — navy fill
              cellStyle = { ...cellStyle, backgroundColor: "#1B3A5C" };
            } else if (day.isToday) {
              // Today, not yet checked in — white fill + gold border
              cellStyle = { ...cellStyle, backgroundColor: "#FFFFFF", border: "2px solid #D4A847" };
            } else if (day.isFuture) {
              // Future day — faded cream
              cellStyle = { ...cellStyle, backgroundColor: "#EDE6D0", opacity: 0.4 };
            } else {
              // Past day with no check-in — missed
              cellStyle = { ...cellStyle, backgroundColor: "#EDE6D0" };
            }

            return (
              <div key={day.dateStr} title={day.label} style={cellStyle} />
            );
          })}
        </div>

        {/* Legend */}
        <div
          className="mt-3 flex items-center gap-5 text-xs"
          style={{ color: "#6A6050" }}
        >
          <span className="flex items-center gap-1.5">
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                backgroundColor: "#1B3A5C",
              }}
            />
            Read
          </span>
          <span className="flex items-center gap-1.5">
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                backgroundColor: "#EDE6D0",
              }}
            />
            Missed
          </span>
          <span className="flex items-center gap-1.5">
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                borderRadius: "3px",
                backgroundColor: "#FFFFFF",
                border: "2px solid #D4A847",
              }}
            />
            Today (unread)
          </span>
        </div>
      </div>
    </section>
  );
}
