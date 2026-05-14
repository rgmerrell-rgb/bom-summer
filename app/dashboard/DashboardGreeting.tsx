"use client";

import { useState, useEffect } from "react";

type Greeting = { salutation: string; emoji: string };

function getGreeting(hour: number): Greeting {
  if (hour >= 5  && hour < 12) return { salutation: "Good morning",   emoji: "☀️" };
  if (hour >= 12 && hour < 17) return { salutation: "Good afternoon",  emoji: "🌤️" };
  return                               { salutation: "Good evening",    emoji: "🌙" };
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  }).format(d);
}

export function DashboardGreeting({ firstName }: { firstName: string }) {
  const [greeting,   setGreeting]   = useState<Greeting>({ salutation: "Good morning", emoji: "☀️" });
  const [dateLabel,  setDateLabel]  = useState("");

  useEffect(() => {
    const now = new Date();
    setGreeting(getGreeting(now.getHours()));
    setDateLabel(formatDate(now));
  }, []);

  return (
    <header>
      <h1 className="text-2xl font-bold" style={{ color: "#2C2416" }}>
        {greeting.emoji} {greeting.salutation}, {firstName}.
      </h1>
      <p className="mt-1 text-sm" style={{ color: "#6A6050" }}>
        {dateLabel}
      </p>
    </header>
  );
}
