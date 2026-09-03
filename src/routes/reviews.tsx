import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star, BarChart3 } from "lucide-react";
import { AppShell, Card, CardTitle, Stat } from "@/components/AppShell";
import { AiToolSurface, useAiText, Field, ChipGroup } from "@/components/AiPanel";
import { useSalon, sentimentScore } from "@/lib/salon-store";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews & Feedback — Mandy Beauty Assistant" },
      {
        name: "description",
        content: "Collect customer reviews, track sentiment trends and get AI-suggested improvements.",
      },
      { property: "og:title", content: "Reviews & Feedback — Mandy Beauty Assistant" },
      { property: "og:description", content: "Sentiment analysis and actionable feedback reports." },
    ],
  }),
  component: Reviews,
});

const PERIODS = ["Last 7 days", "Last 30 days", "This quarter"] as const;
const REPORTS = ["Sentiment summary", "Improvement actions", "Reply drafts"] as const;

function Reviews() {
  const { reviews } = useSalon();
  const { generate, loading } = useAiText();
  const [period, setPeriod] = useState<string>(PERIODS[1]);
  const [reportType, setReportType] = useState<string>(REPORTS[0]);
  const [output, setOutput] = useState("");

  const sentiment = sentimentScore(reviews);
  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  const negative = reviews.filter((r) => r.rating <= 3).length;

  const onGenerate = async () => {
    const corpus = reviews
      .map((r) => `- ${r.rating}★ (${r.service}, ${r.daysAgo}d ago) "${r.text}"`)
      .join("\n");
    const text = await generate(
      "You are Mandy, an analyst for a local beauty salon. Be concise, specific and practical. Use short markdown-free sections with plain headings and bullet points.",
      `Period: ${period}\nReport type: ${reportType}\n\nCustomer reviews:\n${corpus}\n\nProduce the report: overall sentiment, recurring themes (positive and negative), and 3 concrete actions the salon owner can take this week.`,
    );
    if (text) setOutput(text);
  };

  return (
    <AppShell title="Reviews & feedback" subtitle="What clients are saying, and what to do about it.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Average rating" value={`${avg} / 5`} hint={`${reviews.length} reviews`} />
        <Stat label="Positive sentiment" value={`${sentiment}%`} tone="success" hint="weighted score" />
        <Stat label="Needs attention" value={String(negative)} tone="warning" hint="3★ or lower" />
        <Stat label="Response rate" value="86%" hint="replies within 24h" />
      </div>

      <AiToolSurface
        title="Feedback report generator"
        loading={loading}
        onGenerate={onGenerate}
        output={output}
        setOutput={setOutput}
        placeholder="Your sentiment report will appear here — fully editable before you share it with the team."
        form={
          <>
            <Field label="Period">
              <ChipGroup options={PERIODS} value={period} onChange={setPeriod} />
            </Field>
            <Field label="Report type">
              <ChipGroup options={REPORTS} value={reportType} onChange={setReportType} />
            </Field>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Mandy analyses {reviews.length} reviews from your salon and summarises trends, themes and next
              steps.
            </p>
          </>
        }
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle icon={Star}>All reviews</CardTitle>
          <div className="space-y-2.5">
            {reviews.map((r) => (
              <div key={r.id} className="glass-strong rounded-2xl p-3.5">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-warning">{"★".repeat(r.rating)}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {r.client} · {r.service} · {r.daysAgo}d ago
                  </span>
                  {r.rating <= 3 && (
                    <span className="rounded-md bg-warning/10 px-2 py-0.5 text-[10px] text-warning">
                      Follow up
                    </span>
                  )}
                </div>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle icon={BarChart3}>Rating spread</CardTitle>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              const pct = Math.round((count / reviews.length) * 100);
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-6 text-[11px] text-muted-foreground">{star}★</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-[11px] text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
