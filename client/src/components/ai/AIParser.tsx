import { useState } from "react";
import { FiZap, FiAlertCircle, FiCheckCircle, FiLoader } from "react-icons/fi";
import { aiApi } from "../../services/api";
import type { ParsedJobData } from "../../types";

interface Props {
  onParsed: (data: ParsedJobData, suggestions: string[], jd: string) => void;
}

type ParseStep = "idle" | "parsing" | "parsed" | "suggestions" | "done" | "error";

export default function AIParser({ onParsed }: Props) {
  const [jd, setJd] = useState("");
  const [step, setStep] = useState<ParseStep>("idle");
  const [error, setError] = useState("");
  const [parsed, setParsed] = useState<ParsedJobData | null>(null);

  const handleParse = async () => {
    if (jd.trim().length < 50) {
      setError("Please paste a more complete job description (at least 50 characters).");
      return;
    }
    setError("");
    setStep("parsing");

    try {
      const res = await aiApi.parseJD(jd);
      const parsedData = res.data.parsed;
      setParsed(parsedData);
      setStep("suggestions");

      const sugRes = await aiApi.getSuggestions(jd, parsedData);
      const bullets = sugRes.data.suggestions.bullets;
      setStep("done");
      onParsed(parsedData, bullets, jd);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "AI parsing failed. Please try again.");
      setStep("error");
    }
  };

  const isLoading = step === "parsing" || step === "suggestions";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <FiZap className="w-4 h-4 text-indigo-400" />
        <label className="text-sm font-semibold text-slate-200">
          AI Job Description Parser
        </label>
        <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
          Powered by Groq
        </span>
      </div>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        placeholder="Paste the full job description here and let AI auto-fill the fields below…"
        rows={6}
        disabled={isLoading}
        className="input-custom resize-none font-body text-sm leading-relaxed disabled:opacity-60"
      />

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <FiAlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {step === "done" && parsed && (
        <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <FiCheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-300">
            <span className="font-semibold">Parsed successfully!</span> Fields populated and resume suggestions generated.
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          <FiLoader className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
          <p className="text-sm text-indigo-300">
            {step === "parsing" ? "Parsing job description…" : "Generating resume suggestions…"}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={handleParse}
        disabled={isLoading || !jd.trim()}
        className="btn-primary-custom text-sm w-full justify-center py-2"
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <FiZap className="w-4 h-4" />
        )}
        {isLoading
          ? step === "parsing"
            ? "Parsing…"
            : "Generating suggestions…"
          : "Parse with AI"}
      </button>
    </div>
  );
}
