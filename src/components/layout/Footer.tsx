export function Footer() {
  return (
    <footer className="border-border text-muted-foreground mx-auto mt-24 max-w-3xl border-t px-6 py-8 font-mono text-xs">
      © {new Date().getFullYear()} Nick de Raj · built with markdown, katex &amp; recharts
    </footer>
  );
}
