import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card } from "@/components/AppShell";
import { runAi, type AiMessage } from "@/lib/ai.functions";
import { useSalon } from "@/lib/salon-store";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — Mandy Beauty Assistant" },
      {
        name: "description",
        content: "Chat with Mandy about services, pricing, availability and personalised client recommendations.",
      },
      { property: "og:title", content: "AI Chat — Mandy Beauty Assistant" },
      { property: "og:description", content: "Instant answers on services, pricing and availability." },
    ],
  }),
  component: Chat,
});

const SUGGESTIONS = [
  "Which clients should I nudge to rebook today?",
  "What does a balayage cost and how long does it take?",
  "Do we have space for a bridal trial this Friday?",
  "Recommend an add-on for a client who books gel manicures monthly.",
];

function Chat() {
  const { appointments, inventory } = useSalon();
  const call = useServerFn(runAi);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Mandy. Ask me about bookings, services, pricing, stock or clients — I'll answer from your salon data.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const systemPrompt = `You are Mandy, the AI assistant for a local beauty salon. Be warm, brief and concrete.
Salon context:
Appointments: ${appointments
    .map((a) => `${a.date} ${a.time} ${a.service} for ${a.client} with ${a.stylist} (${a.status})`)
    .join("; ")}
Stock: ${inventory.map((i) => `${i.name}: ${i.stock} ${i.unit}`).join("; ")}
Typical prices: balayage R1500, glow facial R650, knotless braids R1200, gel manicure R350, cut & style R400, bridal trial R1800.
If you are unsure, say so and suggest what the owner should verify.`;

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const next: AiMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await call({
        data: { messages: [{ role: "system", content: systemPrompt }, ...next] },
      });
      setMessages([...next, { role: "assistant", content: res.text }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Mandy couldn't reply.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="AI Chat" subtitle="Instant answers for clients and your front desk.">
      <Card className="flex h-[65vh] flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                  : "max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-card px-4 py-2.5 text-sm leading-relaxed text-foreground ring-1 ring-border"
              }
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Mandy is typing…
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-lg bg-card px-2.5 py-1.5 text-[11px] text-muted-foreground ring-1 ring-border hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Mandy about availability, pricing or a client…"
            className="flex-1 rounded-xl bg-card px-4 py-2.5 text-sm text-foreground ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            <Send className="size-4" /> Send
          </button>
        </form>
      </Card>
    </AppShell>
  );
}
