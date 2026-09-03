import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AiToolSurface, useAiText, Field, ChipGroup, inputClass } from "@/components/AiPanel";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research — Mandy Beauty Assistant" },
      {
        name: "description",
        content: "Summarise beauty industry topics and articles, and get insights and recommendations.",
      },
      { property: "og:title", content: "AI Research — Mandy Beauty Assistant" },
      { property: "og:description", content: "Topic summaries, insights and recommendations for salon owners." },
    ],
  }),
  component: Research,
});

const FORMATS = ["Key takeaways", "Executive summary", "Pros & cons"] as const;
const DEPTHS = ["Quick", "Standard", "Deep dive"] as const;

function Research() {
  const { generate, loading } = useAiText();
  const [format, setFormat] = useState<string>(FORMATS[0]);
  const [depth, setDepth] = useState<string>(DEPTHS[1]);
  const [topic, setTopic] = useState("Trends in bond-building hair treatments for 2026");
  const [source, setSource] = useState("");
  const [output, setOutput] = useState("");

  const onGenerate = async () => {
    const text = await generate(
      "You are Mandy, a research assistant for beauty business owners. Be factual and clearly flag anything uncertain or time-sensitive. Never invent statistics or sources.",
      `Topic: ${topic}\nOutput format: ${format}\nDepth: ${depth}\n${
        source ? `Source text to summarise:\n${source}\n` : ""
      }\nProvide the summary, then 3 insights and 3 recommendations tailored to a small local salon.`,
    );
    if (text) setOutput(text);
  };

  return (
    <AppShell title="AI research assistant" subtitle="Summarise topics and articles, then act on the insights.">
      <AiToolSurface
        title="Research brief"
        loading={loading}
        onGenerate={onGenerate}
        output={output}
        setOutput={setOutput}
        placeholder="Your research summary, insights and recommendations appear here — edit before sharing."
        form={
          <>
            <Field label="Topic or question">
              <input className={inputClass} value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Field>
            <Field label="Paste an article (optional)">
              <textarea
                className={`${inputClass} min-h-28 resize-y`}
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Paste text to summarise instead of researching from the topic alone."
              />
            </Field>
            <Field label="Format">
              <ChipGroup options={FORMATS} value={format} onChange={setFormat} />
            </Field>
            <Field label="Depth">
              <ChipGroup options={DEPTHS} value={depth} onChange={setDepth} />
            </Field>
          </>
        }
      />
    </AppShell>
  );
}
