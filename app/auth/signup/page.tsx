import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="mx-auto mt-20 max-w-sm px-4">
      <h1 className="text-2xl font-bold text-bom-text">Create an account</h1>
      <p className="mt-1 text-sm text-bom-muted">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-bom-navy hover:underline">
          Sign in
        </Link>
      </p>

      <form className="mt-6 flex flex-col gap-4" action="/api/auth/signup" method="POST">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-bom-text">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="rounded-md border border-bom-border bg-white px-3 py-2 text-sm text-bom-text placeholder:text-bom-muted focus:border-bom-navy focus:outline-none focus:ring-2 focus:ring-bom-navy/20"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-bom-text">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="rounded-md border border-bom-border bg-white px-3 py-2 text-sm text-bom-text placeholder:text-bom-muted focus:border-bom-navy focus:outline-none focus:ring-2 focus:ring-bom-navy/20"
          />
        </div>

        <button
          type="submit"
          className="rounded-md py-2 text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#1B3A5C", color: "#FFFFFF" }}
        >
          Create account
        </button>
      </form>
    </div>
  );
}
