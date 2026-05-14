export type { Database, Json } from "./database";

// ---------------------------------------------------------------------------
// Domain types — expand as your schema grows
// ---------------------------------------------------------------------------

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};
