import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, CalendarDays, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card, CardTitle } from "@/components/AppShell";
import { Field, inputClass } from "@/components/AiPanel";
import { useSalon, type AppointmentStatus } from "@/lib/salon-store";

export const Route = createFileRoute("/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — Mandy Beauty Assistant" },
      {
        name: "description",
        content: "Book, reschedule and cancel client appointments, send reminders and manage staff calendars.",
      },
      { property: "og:title", content: "Appointments — Mandy Beauty Assistant" },
      { property: "og:description", content: "Booking, reminders and staff calendars for your salon." },
    ],
  }),
  component: Appointments,
});

const SERVICES = ["Balayage", "Glow facial", "Knotless braids", "Gel manicure", "Cut & style", "Bridal trial"];

function Appointments() {
  const { appointments, stylists, addAppointment, updateAppointment, removeAppointment } = useSalon();
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    client: "",
    service: SERVICES[0] as string,
    stylist: stylists[0] as string,
    date: today,
    time: "10:00",
    durationMin: 60,
  });

  const byStylist = stylists.map((s) => ({
    stylist: s,
    items: appointments.filter((a) => a.stylist === s && a.status !== "cancelled"),
  }));

  const submit = () => {
    if (!form.client.trim()) {
      toast.error("Add a client name first.");
      return;
    }
    const clash = appointments.some(
      (a) => a.stylist === form.stylist && a.date === form.date && a.time === form.time && a.status !== "cancelled",
    );
    if (clash) {
      toast.error(`${form.stylist} already has a booking at ${form.time}.`);
      return;
    }
    addAppointment({ ...form, status: "confirmed" });
    toast.success(`Booked ${form.client} · confirmation sent`);
    setForm({ ...form, client: "" });
  };

  const setStatus = (id: string, status: AppointmentStatus) => {
    updateAppointment(id, { status });
    toast.success(status === "cancelled" ? "Appointment cancelled" : `Marked ${status}`);
  };

  return (
    <AppShell title="Appointments" subtitle="Bookings, reminders and staff calendars in one place.">
      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <CardTitle icon={CalendarDays}>New booking</CardTitle>
          <div className="space-y-3">
            <Field label="Client">
              <input
                className={inputClass}
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                placeholder="e.g. Amara Okonkwo"
              />
            </Field>
            <Field label="Service">
              <select
                className={inputClass}
                value={form.service}
                onChange={(e) => setForm({ ...form, service: e.target.value })}
              >
                {SERVICES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Stylist">
              <select
                className={inputClass}
                value={form.stylist}
                onChange={(e) => setForm({ ...form, stylist: e.target.value })}
              >
                {stylists.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Date">
                <input
                  type="date"
                  className={inputClass}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Field>
              <Field label="Time">
                <input
                  type="time"
                  className={inputClass}
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                />
              </Field>
            </div>
            <button
              onClick={submit}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Book & confirm
            </button>
          </div>
        </Card>

        <div className="space-y-3 lg:col-span-2">
          <Card>
            <CardTitle icon={CalendarDays}>Schedule</CardTitle>
            <div className="divide-y divide-border">
              {appointments.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="w-28 shrink-0 text-xs text-muted-foreground">
                    {a.date === today ? "Today" : a.date} · {a.time}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">
                      {a.service} — {a.client}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {a.stylist} · {a.durationMin} min · {a.status}
                      {a.reminderSent ? " · reminder sent" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        updateAppointment(a.id, { reminderSent: true });
                        toast.success(`Reminder sent to ${a.client}`);
                      }}
                      className="rounded-lg bg-card p-1.5 text-muted-foreground ring-1 ring-border hover:text-primary"
                      aria-label="Send reminder"
                    >
                      <Bell className="size-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const time = window.prompt("New time (HH:MM)", a.time);
                        if (time) {
                          updateAppointment(a.id, { time, status: "pending", reminderSent: false });
                          toast.success("Rescheduled — confirmation requested");
                        }
                      }}
                      className="rounded-lg bg-card px-2 py-1.5 text-[11px] text-muted-foreground ring-1 ring-border hover:text-primary"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => setStatus(a.id, "cancelled")}
                      className="rounded-lg bg-card px-2 py-1.5 text-[11px] text-muted-foreground ring-1 ring-border hover:text-destructive"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => removeAppointment(a.id)}
                      className="rounded-lg bg-card p-1.5 text-muted-foreground ring-1 ring-border hover:text-destructive"
                      aria-label="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle icon={CalendarDays}>Staff load</CardTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {byStylist.map(({ stylist, items }) => (
                <div key={stylist} className="glass-strong rounded-2xl p-3.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{stylist}</p>
                    <span className="text-[11px] text-muted-foreground">{items.length} booked</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, items.length * 20)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {items.length < 3 ? "Open slots — good for promo bookings" : "Near capacity"}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
