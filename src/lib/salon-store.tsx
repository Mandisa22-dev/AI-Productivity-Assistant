import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type AppointmentStatus = "confirmed" | "pending" | "cancelled";

export type Appointment = {
  id: string;
  client: string;
  service: string;
  stylist: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  durationMin: number;
  status: AppointmentStatus;
  reminderSent: boolean;
};

export type InventoryItem = {
  id: string;
  name: string;
  stock: number;
  reorderPoint: number;
  weeklyUsage: number;
  unit: string;
};

export type Review = {
  id: string;
  client: string;
  rating: number;
  text: string;
  daysAgo: number;
  service: string;
};

export type Campaign = {
  id: string;
  title: string;
  channel: "Instagram" | "Newsletter" | "SMS";
  scheduledFor: string;
  status: "Draft" | "Scheduled" | "Sent";
  reach: number;
  engagement: number;
};

const today = () => new Date().toISOString().slice(0, 10);

const STYLISTS = ["Dele", "Rina", "Ava", "Zanele"];

const seedAppointments: Appointment[] = [
  { id: "a1", client: "Amara Okonkwo", service: "Balayage", stylist: "Dele", date: today(), time: "09:30", durationMin: 120, status: "confirmed", reminderSent: true },
  { id: "a2", client: "Tobi Adebayo", service: "Glow facial", stylist: "Rina", date: today(), time: "11:00", durationMin: 45, status: "pending", reminderSent: false },
  { id: "a3", client: "Chika Nwosu", service: "Knotless braids", stylist: "Dele", date: today(), time: "13:30", durationMin: 180, status: "confirmed", reminderSent: true },
  { id: "a4", client: "Lerato Mokoena", service: "Gel manicure", stylist: "Zanele", date: today(), time: "15:00", durationMin: 45, status: "confirmed", reminderSent: false },
  { id: "a5", client: "Priya Anand", service: "Bridal trial", stylist: "Ava", date: today(), time: "16:30", durationMin: 90, status: "pending", reminderSent: false },
];

const seedInventory: InventoryItem[] = [
  { id: "i1", name: "Keratin shampoo 500ml", stock: 3, reorderPoint: 8, weeklyUsage: 5, unit: "bottles" },
  { id: "i2", name: "Argan oil treatment", stock: 5, reorderPoint: 10, weeklyUsage: 6, unit: "bottles" },
  { id: "i3", name: "Curl cream 250ml", stock: 2, reorderPoint: 10, weeklyUsage: 7, unit: "jars" },
  { id: "i4", name: "Bond repair mask", stock: 24, reorderPoint: 10, weeklyUsage: 4, unit: "tubs" },
  { id: "i5", name: "Gel polish — nude set", stock: 14, reorderPoint: 6, weeklyUsage: 3, unit: "sets" },
  { id: "i6", name: "Disposable towels", stock: 7, reorderPoint: 12, weeklyUsage: 20, unit: "packs" },
];

const seedReviews: Review[] = [
  { id: "r1", client: "Amara O.", rating: 5, text: "Dele's colour work is always flawless. The glow facial left my skin glowing for days.", daysAgo: 2, service: "Balayage" },
  { id: "r2", client: "Nora B.", rating: 4, text: "Lovely finish and friendly team, but my appointment ran about 25 minutes late.", daysAgo: 4, service: "Gel manicure" },
  { id: "r3", client: "Priya A.", rating: 5, text: "Bridal trial was perfect — they really listened to what I wanted.", daysAgo: 6, service: "Bridal trial" },
  { id: "r4", client: "Sipho M.", rating: 3, text: "Great cut, but booking over the phone took forever and nobody confirmed.", daysAgo: 9, service: "Cut & style" },
  { id: "r5", client: "Chika N.", rating: 5, text: "My braids lasted eight weeks. Worth every naira.", daysAgo: 12, service: "Knotless braids" },
];

const seedCampaigns: Campaign[] = [
  { id: "c1", title: "Weekend glow special", channel: "Instagram", scheduledFor: "Fri 17:00", status: "Scheduled", reach: 2400, engagement: 8.2 },
  { id: "c2", title: "May newsletter — new colour menu", channel: "Newsletter", scheduledFor: "Mon 09:00", status: "Draft", reach: 0, engagement: 0 },
  { id: "c3", title: "Rebooking nudge — lapsed clients", channel: "SMS", scheduledFor: "Sent Tue", status: "Sent", reach: 180, engagement: 21.5 },
];

type SalonState = {
  appointments: Appointment[];
  inventory: InventoryItem[];
  reviews: Review[];
  campaigns: Campaign[];
  stylists: string[];
  addAppointment: (a: Omit<Appointment, "id" | "reminderSent">) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  restock: (id: string, qty: number) => void;
  addCampaign: (c: Omit<Campaign, "id" | "reach" | "engagement">) => void;
};

const SalonContext = createContext<SalonState | null>(null);

const STORAGE_KEY = "mandy-salon-state-v1";

export function SalonProvider({ children }: { children: ReactNode }) {
  const [appointments, setAppointments] = useState<Appointment[]>(seedAppointments);
  const [inventory, setInventory] = useState<InventoryItem[]>(seedInventory);
  const [campaigns, setCampaigns] = useState<Campaign[]>(seedCampaigns);
  const reviews = seedReviews;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<{
        appointments: Appointment[];
        inventory: InventoryItem[];
        campaigns: Campaign[];
      }>;
      if (parsed.appointments) setAppointments(parsed.appointments);
      if (parsed.inventory) setInventory(parsed.inventory);
      if (parsed.campaigns) setCampaigns(parsed.campaigns);
    } catch {
      /* ignore corrupt state */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ appointments, inventory, campaigns }));
    } catch {
      /* storage unavailable */
    }
  }, [appointments, inventory, campaigns]);

  const addAppointment = useCallback((a: Omit<Appointment, "id" | "reminderSent">) => {
    setAppointments((prev) =>
      [...prev, { ...a, id: crypto.randomUUID(), reminderSent: false }].sort((x, y) =>
        (x.date + x.time).localeCompare(y.date + y.time),
      ),
    );
  }, []);

  const updateAppointment = useCallback((id: string, patch: Partial<Appointment>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }, []);

  const removeAppointment = useCallback((id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const adjustStock = useCallback((id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i)),
    );
  }, []);

  const restock = useCallback((id: string, qty: number) => {
    setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, stock: i.stock + qty } : i)));
  }, []);

  const addCampaign = useCallback((c: Omit<Campaign, "id" | "reach" | "engagement">) => {
    setCampaigns((prev) => [{ ...c, id: crypto.randomUUID(), reach: 0, engagement: 0 }, ...prev]);
  }, []);

  const value = useMemo<SalonState>(
    () => ({
      appointments,
      inventory,
      reviews,
      campaigns,
      stylists: STYLISTS,
      addAppointment,
      updateAppointment,
      removeAppointment,
      adjustStock,
      restock,
      addCampaign,
    }),
    [appointments, inventory, reviews, campaigns, addAppointment, updateAppointment, removeAppointment, adjustStock, restock, addCampaign],
  );

  return <SalonContext.Provider value={value}>{children}</SalonContext.Provider>;
}

export function useSalon() {
  const ctx = useContext(SalonContext);
  if (!ctx) throw new Error("useSalon must be used inside SalonProvider");
  return ctx;
}

export function sentimentScore(reviews: Review[]) {
  if (!reviews.length) return 0;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return Math.round(((avg - 1) / 4) * 100);
}
