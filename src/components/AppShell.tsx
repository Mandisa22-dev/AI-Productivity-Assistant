import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Star,
  Sparkles,
  Package,
  Megaphone,
  Search,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/reviews", label: "Reviews", icon: Star },
  { to: "/chat", label: "AI Chat", icon: Sparkles },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/marketing", label: "Marketing", icon: Megaphone },
  { to: "/research", label: "Research", icon: Search },
  { to: "/email", label: "Email", icon: Mail },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          activeProps={{
            className:
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium bg-primary/10 text-primary ring-1 ring-primary/15",
          }}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="mb-2 flex items-center gap-2.5 px-3 py-2">
      <div className="grid size-9 place-items-center rounded-[10px] bg-gradient-to-br from-accent to-primary font-display font-semibold text-primary-foreground">
        M
      </div>
      <div>
        <p className="font-display text-sm font-semibold leading-none text-foreground">Mandy</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">Beauty Assistant</p>
      </div>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-canvas min-h-screen">
      <div className="flex min-h-screen">
        <aside className="glass sticky top-3 m-3 hidden h-[calc(100vh-1.5rem)] w-60 shrink-0 flex-col gap-1 rounded-3xl p-4 md:flex">
          <Brand />
          <NavLinks />
          <div className="mt-auto rounded-xl bg-card px-3 py-3">
            <p className="mb-1.5 text-[11px] text-muted-foreground">Plan</p>
            <p className="font-display text-xs font-semibold text-foreground">Salon Pro</p>
          </div>
        </aside>

        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              aria-label="Close navigation"
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <aside className="glass-strong absolute left-3 top-3 flex h-[calc(100vh-1.5rem)] w-60 flex-col gap-1 rounded-3xl p-4">
              <Brand />
              <NavLinks onNavigate={() => setOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
            <header className="flex flex-wrap items-center gap-3">
              <button
                className="glass grid size-10 shrink-0 place-items-center rounded-xl md:hidden"
                onClick={() => setOpen(true)}
                aria-label="Open navigation"
              >
                {open ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-pretty font-display text-2xl font-semibold text-foreground">{title}</h1>
                {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-2">{actions}</div>}
            </header>
            {children}
            <p className="pb-4 text-center text-[11px] leading-relaxed text-muted-foreground">
              Responsible AI: Mandy drafts suggestions from your salon data. Output can be inaccurate or
              incomplete — always review before sending, publishing, or acting on it.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`glass rounded-3xl p-5 ${className}`}>{children}</section>;
}

export function CardTitle({ children, icon: Icon }: { children: ReactNode; icon?: typeof Star }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      {Icon && (
        <span className="grid size-6 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </span>
      )}
      <h2 className="font-display text-sm font-semibold text-foreground">{children}</h2>
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning" | "success";
}) {
  const toneClass =
    tone === "warning" ? "text-warning" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="glass rounded-2xl p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1.5 font-display text-2xl font-semibold ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
