import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Sparkles, Star } from "lucide-react";
import { AppShell, Card, CardTitle, Stat } from "@/components/AppShell";
import { useSalon, sentimentScore } from "@/lib/salon-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Mandy Beauty Assistant" },
      {
        name: "description",
        content:
          "Daily overview of bookings, review sentiment, revenue and low stock for your beauty business.",
      },
      { property: "og:title", content: "Dashboard — Mandy Beauty Assistant" },
      {
        property: "og:description",
        content: "Daily overview of bookings, review sentiment, revenue and low stock.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { appointments, inventory, reviews } = useSalon();
  const today = new Date().toISOString().slice(0, 10);
  const todays = appointments.filter((a) => a.date === today && a.status !== "cancelled");
  const low = inventory.filter((i) => i.stock <= i.reorderPoint);
  const sentiment = sentimentScore(reviews);
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const revenue = todays.length * 8500;

  return (
    <AppShell
      title="Good morning, Mandy"
      subtitle="Here's how your salon is flowing today."
      actions={
        <Link
          to="/chat"
          className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Sparkles className="size-4" /> Ask Mandy
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Today's bookings" value={String(todays.length)} hint="across all stylists" />
        <Stat label="Sentiment" value={`+${sentiment}%`} hint={`${avg} avg · ${reviews.length} reviews`} />
        <Stat label="Projected revenue" value={`R${(revenue / 1000).toFixed(1)}k`} hint="today" tone="success" />
        <Stat
          label="Low stock"
          value={String(low.length)}
          hint="reorder suggested"
          tone={low.length ? "warning" : "default"}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-foreground">Today's appointments</h2>
              <Link to="/appointments" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-border">
              {todays.length === 0 && <p className="py-4 text-sm text-muted-foreground">No bookings today.</p>}
              {todays.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2.5">
                  <span className="w-12 shrink-0 text-xs font-medium text-muted-foreground">{a.time}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {a.service} — {a.client}
                    </p>
                    <p className="text-[11px] text-muted-foreground">Stylist: {a.stylist}</p>
                  </div>
                  <span
                    className={
                      a.status === "confirmed"
                        ? "rounded-md bg-success/10 px-2 py-0.5 text-[11px] text-success"
                        : "rounded-md bg-warning/10 px-2 py-0.5 text-[11px] text-warning"
                    }
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle icon={Star}>Recent reviews</CardTitle>
            <div className="space-y-2.5">
              {reviews.slice(0, 3).map((r) => (
                <div key={r.id} className="glass-strong rounded-2xl p-3.5">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs text-warning">{"★".repeat(r.rating)}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {r.client} · {r.daysAgo}d ago
                    </span>
                  </div>
                  <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <CardTitle icon={AlertTriangle}>Low stock</CardTitle>
            <div className="space-y-2.5">
              {low.map((i) => (
                <div key={i.id} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{i.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {i.stock} {i.unit} left
                    </p>
                  </div>
                  <span className={i.stock <= 2 ? "text-[11px] text-destructive" : "text-[11px] text-warning"}>
                    {i.stock <= 2 ? "Critical" : "Reorder"}
                  </span>
                </div>
              ))}
              {low.length === 0 && <p className="text-sm text-muted-foreground">Everything is well stocked.</p>}
            </div>
            <Link
              to="/inventory"
              className="mt-4 block rounded-xl bg-card py-2 text-center text-sm font-medium text-foreground ring-1 ring-border hover:bg-secondary"
            >
              Open inventory
            </Link>
          </Card>

          <section className="glass rounded-3xl bg-gradient-to-br from-primary/10 to-accent/15 p-5">
            <CardTitle icon={Sparkles}>Quick ask Mandy</CardTitle>
            <p className="mb-3 text-pretty text-xs leading-relaxed text-muted-foreground">
              "Which clients should I send a rebooking nudge to today?"
            </p>
            <Link
              to="/chat"
              className="block rounded-xl bg-card py-2 text-center text-sm font-medium text-foreground ring-1 ring-border hover:bg-secondary"
            >
              Open AI Chat
            </Link>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
