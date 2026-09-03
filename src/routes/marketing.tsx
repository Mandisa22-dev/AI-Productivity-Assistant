import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Megaphone, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card, CardTitle, Stat } from "@/components/AppShell";
import { AiToolSurface, useAiText, Field, ChipGroup, inputClass } from "@/components/AiPanel";
import { useSalon } from "@/lib/salon-store";

export const Route = createFileRoute("/marketing")({
  head: () => ({
    meta: [
      { title: "Marketing — Mandy Beauty Assistant" },
      {
        name: "description",
        content: "Generate promotional posts and newsletters, schedule campaigns and track engagement.",
      },
      { property: "og:title", content: "Marketing — Mandy Beauty Assistant" },
      { property: "og:description", content: "AI-generated salon promos, campaigns and engagement metrics." },
    ],
  }),
  component: Marketing,
});

const CHANNELS = ["Instagram", "Newsletter", "SMS"] as const;
const TONES = ["Friendly", "Formal", "Persuasive"] as const;
const AUDIENCES = ["All clients", "Lapsed clients", "Colour clients", "Bridal enquiries"] as const;

function Marketing() {
  const { campaigns, addCampaign } = useSalon();
  const { generate, loading } = useAiText();
  const [channel, setChannel] = useState<string>(CHANNELS[0]);
  const [tone, setTone] = useState<string>(TONES[0]);
  const [audience, setAudience] = useState<string>(AUDIENCES[0]);
  const [brief, setBrief] = useState("A warm weekend special on balayage and our glow facial, limited slots.");
  const [output, setOutput] = useState("");
  const [scheduleAt, setScheduleAt] = useState("Fri 17:00");

  const onGenerate = async () => {
    const text = await generate(
      "You are Mandy, a marketing copywriter for a local beauty salon. Write ready-to-publish copy. Keep it human, specific and free of clichés. No hashtag spam — max 4 relevant hashtags for social.",
      `Channel: ${channel}\nTone: ${tone}\nAudience: ${audience}\nBrief: ${brief}\n\nWrite the post/newsletter copy, plus a one-line call to action.`,
    );
    if (text) setOutput(text);
  };

  const schedule = () => {
    if (!output.trim()) {
      toast.error("Generate or write content first.");
      return;
    }
    addCampaign({
      title: brief.slice(0, 48),
      channel: channel as "Instagram" | "Newsletter" | "SMS",
      scheduledFor: scheduleAt,
      status: "Scheduled",
    });
    toast.success(`Campaign scheduled for ${scheduleAt}`);
  };

  const totalReach = campaigns.reduce((s, c) => s + c.reach, 0);

  return (
    <AppShell title="Marketing" subtitle="Content, campaigns and engagement for your salon.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Campaigns" value={String(campaigns.length)} />
        <Stat label="Scheduled" value={String(campaigns.filter((c) => c.status === "Scheduled").length)} />
        <Stat label="Total reach" value={`${(totalReach / 1000).toFixed(1)}k`} tone="success" />
        <Stat label="Avg engagement" value="12.4%" hint="last 30 days" />
      </div>

      <AiToolSurface
        title="Content studio"
        loading={loading}
        onGenerate={onGenerate}
        output={output}
        setOutput={setOutput}
        placeholder="Your promo copy appears here — edit freely before scheduling."
        form={
          <>
            <Field label="Channel">
              <ChipGroup options={CHANNELS} value={channel} onChange={setChannel} />
            </Field>
            <Field label="Tone">
              <ChipGroup options={TONES} value={tone} onChange={setTone} />
            </Field>
            <Field label="Audience">
              <ChipGroup options={AUDIENCES} value={audience} onChange={setAudience} />
            </Field>
            <Field label="Brief">
              <textarea
                className={`${inputClass} min-h-20 resize-y`}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
              />
            </Field>
          </>
        }
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <CardTitle icon={CalendarClock}>Schedule this post</CardTitle>
          <Field label="Send at">
            <input className={inputClass} value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
          </Field>
          <button
            onClick={schedule}
            className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Schedule campaign
          </button>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle icon={Megaphone}>Campaigns</CardTitle>
          <div className="divide-y divide-border">
            {campaigns.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">{c.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {c.channel} · {c.scheduledFor}
                  </p>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  {c.reach ? `${c.reach} reached · ${c.engagement}%` : "no data yet"}
                </span>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] text-primary">{c.status}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
