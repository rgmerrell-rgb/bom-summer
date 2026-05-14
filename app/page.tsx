import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-bom-text">
        Make this summer count{" "}
        <span className="text-bom-navy">in the scriptures.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-bom-muted">
        Book of Mormon Summer helps you build a daily reading habit, track your
        progress, and stay consistent all season long.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <Link
          href="/auth/signup"
          className="rounded-md bg-bom-navy px-8 py-3 text-base font-medium text-white shadow hover:bg-bom-navy-dark transition-colors"
        >
          Get started — it&apos;s free
        </Link>
        <Link
          href="/auth/login"
          className="rounded-md border border-bom-border px-8 py-3 text-base font-medium text-bom-text hover:bg-bom-cream-dark transition-colors"
        >
          Sign in
        </Link>
      </div>
    </section>
  );
}
