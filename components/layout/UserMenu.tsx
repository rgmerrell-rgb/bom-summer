"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function UserMenu({
  initialEmail,
  isAdmin = false,
}: {
  initialEmail: string | null;
  isAdmin?: boolean;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [open, setOpen]   = useState(false);
  const menuRef           = useRef<HTMLDivElement>(null);
  const supabase          = useRef(createClient()).current;

  // Stay in sync with auth state changes (sign-in, sign-out, token refresh)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  if (!email) {
    return (
      <Link
        href="/auth/login"
        className="rounded-md px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ backgroundColor: "#D4A847", color: "#2C2416" }}
      >
        Sign in
      </Link>
    );
  }

  const initial = email[0].toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: "#1B3A5C", border: "2px solid #D4A847" }}
        aria-label="User menu"
      >
        {initial}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl bg-white shadow-lg"
          style={{ border: "1px solid #DDD5BB", zIndex: 50 }}
        >
          <Link
            href="/dashboard"
            className="block px-4 py-3 text-sm font-medium transition-colors"
            style={{ color: "#2C2416" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5F0E2")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          {isAdmin && (
            <>
              <div style={{ borderTop: "1px solid #DDD5BB" }} />
              <Link
                href="/admin"
                className="block px-4 py-3 text-sm font-medium transition-colors"
                style={{ color: "#2C2416" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5F0E2")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
                onClick={() => setOpen(false)}
              >
                Admin
              </Link>
            </>
          )}
          <div style={{ borderTop: "1px solid #DDD5BB" }} />
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full px-4 py-3 text-left text-sm font-medium transition-colors"
              style={{ color: "#2C2416" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#F5F0E2")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "")}
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
