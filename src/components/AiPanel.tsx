import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { runAi } from "@/lib/ai.functions";
import { Card } from "@/components/AppShell";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl bg-card px-3 py-2 text-sm text-foreground ring-1 ring-border outline-none focus:ring-2 focus:ring-ring";

export function ChipGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={
            o === value
              ? "rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary ring-1 ring-primary/20"
              : "rounded-lg bg-card px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-border hover:text-foreground"
          }
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function useAiText() {
  const call = useServerFn(runAi);
  const [loading, setLoading] = useState(false);

  const generate = async (system: string, prompt: string) => {
    setLoading(true);
    try {
      const res = await call({
        data: {
          messages: [
            { role: "system" as const, content: system },
            { role: "user" as const, content: prompt },
          ],
        },
      });
      return res.text;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Mandy couldn't generate that.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading };
}

/** Structured-prompt form on the left, editable AI output on the right. */
export function AiToolSurface({
  title,
  form,
  onGenerate,
  loading,
  output,
  setOutput,
  placeholder,
}: {
  title: string;
  form: ReactNode;
  onGenerate: () => void;
  loading: boolean;
  output: string;
  setOutput: (v: string) => void;
  placeholder: string;
}) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold text-foreground">{title}</h2>
        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary">Structured prompt</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {form}
          <button
            onClick={onGenerate}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            {loading ? "Mandy is writing…" : "Generate"}
          </button>
        </div>

        <div className="glass-strong rounded-2xl p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-medium text-muted-foreground">AI output</p>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] text-primary">Editable</span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(output);
                  toast.success("Copied to clipboard");
                }}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Copy output"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          </div>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            placeholder={placeholder}
            className="min-h-56 w-full resize-y bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        AI-generated content may be inaccurate. Mandy does not verify availability, pricing or claims — review
        and edit before publishing or sending.
      </p>
    </Card>
  );
}
