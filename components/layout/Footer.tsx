export default function Footer() {
  return (
    <footer className="border-t border-bom-border bg-bom-cream py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-bom-muted">
        &copy; {new Date().getFullYear()} Book of Mormon Summer. All rights reserved.
      </div>
    </footer>
  );
}
