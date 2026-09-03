import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AiToolSurface, useAiText, Field, ChipGroup, inputClass } from "@/components/AiPanel";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email — Mandy Beauty Assistant" },
      {
        name: "description",
        content: "Generate professional client emails in a formal, friendly or persuasive tone.",
      },
      { property: "og:title", content: "Smart Email — Mandy Beauty Assistant" },
      { property: "og:description", content: "Draft professional salon emails in seconds." },
    ],
  }),
  component: EmailStudio,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;
const PURPOSES = [
  "Win back a lapsed client",
  "Booking confirmation",
  "Apology & recovery",
  "Supplier order",
  "Promotion announcement",
] as const;
const LENGTHS = ["Short", "Medium", "Detailed"] as const;

function EmailStudio() {
  const { generate, loading } = useAiText();
  const [tone, setTone] = useState<string>(TONES[1]);
  const [purpose, setPurpose] = useState<string>(PURPOSES[0]);
  const [length, setLength] = useState<string>(LENGTHS[0]);
  const [recipient, setRecipient] = useState("Priya Anand");
  const [details, setDetails] = useState("Offer 20% off her next colour service, valid for two weeks.");
  const [output, setOutput] = useState("");

  const onGenerate = async () => {
    const text = await generate(
      "You are Mandy, writing emails on behalf of a local beauty salon owner. Output a subject line then the email body. Never invent prices, dates or policies that were not provided.",
      `Purpose: ${purpose}\nRecipient: ${recipient}\nTone: ${tone}\nLength: ${length}\nDetails: ${details}`,
    );
    if (text) setOutput(text);
  };

  return (
    <AppShell
      title="Smart email generator"
      subtitle="Professional client and supplier emails, in your tone."
      actions={
        <button
          onClick={() => {
            if (!output.trim()) {
              toast.error("Generate an email first.");
              return;
            }
            toast.success(`Email queued to ${recipient}`);
          }}
          className="rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Send email
        </button>
      }
    >
      <AiToolSurface
        title="Email draft"
        loading={loading}
        onGenerate={onGenerate}
        output={output}
        setOutput={setOutput}
        placeholder="Subject line and body appear here — edit every word before sending."
        form={
          <>
            <Field label="Purpose">
              <ChipGroup options={PURPOSES} value={purpose} onChange={setPurpose} />
            </Field>
            <Field label="Recipient">
              <input className={inputClass} value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </Field>
            <Field label="Tone">
              <ChipGroup options={TONES} value={tone} onChange={setTone} />
            </Field>
            <Field label="Length">
              <ChipGroup options={LENGTHS} value={length} onChange={setLength} />
            </Field>
            <Field label="Key details">
              <textarea
                className={`${inputClass} min-h-20 resize-y`}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </Field>
          </>
        }
      />
    </AppShell>
  );
}
