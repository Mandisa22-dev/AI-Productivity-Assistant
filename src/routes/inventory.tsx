import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card, CardTitle, Stat } from "@/components/AppShell";
import { AiToolSurface, useAiText, Field, ChipGroup } from "@/components/AiPanel";
import { useSalon } from "@/lib/salon-store";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Mandy Beauty Assistant" },
      {
        name: "description",
        content: "Track salon product stock in real time, get low-stock alerts and AI reorder suggestions.",
      },
      { property: "og:title", content: "Inventory — Mandy Beauty Assistant" },
      { property: "og:description", content: "Real-time stock levels and smart reorder suggestions." },
    ],
  }),
  component: Inventory,
});

const HORIZONS = ["Next 2 weeks", "Next month", "Next quarter"] as const;

function Inventory() {
  const { inventory, adjustStock, restock } = useSalon();
  const { generate, loading } = useAiText();
  const [horizon, setHorizon] = useState<string>(HORIZONS[0]);
  const [output, setOutput] = useState("");

  const low = inventory.filter((i) => i.stock <= i.reorderPoint);
  const critical = inventory.filter((i) => i.stock <= Math.round(i.reorderPoint / 3));

  const onGenerate = async () => {
    const table = inventory
      .map(
        (i) =>
          `${i.name}: ${i.stock} ${i.unit} in stock, reorder point ${i.reorderPoint}, avg weekly usage ${i.weeklyUsage}`,
      )
      .join("\n");
    const text = await generate(
      "You are Mandy, an inventory planner for a beauty salon. Be practical and numeric. No markdown tables — use simple lines.",
      `Planning horizon: ${horizon}\n\nCurrent stock:\n${table}\n\nProduce a reorder plan: which items to order, suggested quantities based on usage, urgency, and an estimated stock-out date for anything at risk.`,
    );
    if (text) setOutput(text);
  };

  return (
    <AppShell title="Inventory" subtitle="Real-time stock levels, alerts and reorder planning.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Products tracked" value={String(inventory.length)} />
        <Stat label="Low stock" value={String(low.length)} tone="warning" hint="at or below reorder point" />
        <Stat label="Critical" value={String(critical.length)} tone="warning" hint="order today" />
        <Stat
          label="Weekly usage"
          value={String(inventory.reduce((s, i) => s + i.weeklyUsage, 0))}
          hint="units across all products"
        />
      </div>

      <Card>
        <CardTitle icon={Package}>Stock levels</CardTitle>
        <div className="divide-y divide-border">
          {inventory.map((i) => {
            const pct = Math.min(100, Math.round((i.stock / (i.reorderPoint * 2)) * 100));
            const isLow = i.stock <= i.reorderPoint;
            return (
              <div key={i.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-48 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground">{i.name}</p>
                    {isLow && (
                      <span className="rounded-md bg-warning/10 px-2 py-0.5 text-[10px] text-warning">Low</span>
                    )}
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${isLow ? "bg-warning" : "bg-primary"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {i.stock} {i.unit} · uses ~{i.weeklyUsage}/week · reorder at {i.reorderPoint}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => adjustStock(i.id, -1)}
                    className="rounded-lg bg-card p-1.5 text-muted-foreground ring-1 ring-border hover:text-foreground"
                    aria-label={`Use one ${i.name}`}
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <button
                    onClick={() => adjustStock(i.id, 1)}
                    className="rounded-lg bg-card p-1.5 text-muted-foreground ring-1 ring-border hover:text-foreground"
                    aria-label={`Add one ${i.name}`}
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      restock(i.id, i.reorderPoint * 2);
                      toast.success(`Reordered ${i.reorderPoint * 2} ${i.unit} of ${i.name}`);
                    }}
                    className="rounded-lg bg-card px-2 py-1.5 text-[11px] text-muted-foreground ring-1 ring-border hover:text-primary"
                  >
                    Reorder
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <AiToolSurface
        title="Reorder assistant"
        loading={loading}
        onGenerate={onGenerate}
        output={output}
        setOutput={setOutput}
        placeholder="Mandy's reorder plan will appear here — edit quantities before sending to your supplier."
        form={
          <>
            <Field label="Planning horizon">
              <ChipGroup options={HORIZONS} value={horizon} onChange={setHorizon} />
            </Field>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Suggestions are based on current stock and average weekly usage per product.
            </p>
          </>
        }
      />
    </AppShell>
  );
}
