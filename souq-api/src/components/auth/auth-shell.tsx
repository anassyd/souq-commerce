import Link from "next/link";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="container grid min-h-[calc(100vh-180px)] place-items-center py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="font-display text-3xl font-extrabold">souq<span className="text-deal">.</span></Link>
        <h1 className="mt-8 text-4xl font-bold">{title}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
        <p className="mt-8 text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
