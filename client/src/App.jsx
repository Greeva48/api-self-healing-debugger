import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:3000/debug";

const PIPELINE_STEPS = [
  { label: "Executing request", duration: 600 },
  { label: "Analyzing error", duration: 800 },
  { label: "Applying fix", duration: 600 },
  { label: "Retrying request", duration: 500 },
];

// ─── Icons (inline SVGs) ───────────────────────────────────────────────────

function IconDebug({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.66V20a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h5.34" />
      <polygon points="18 2 22 6 12 16 8 16 8 12 18 2" />
    </svg>
  );
}

function IconCheck({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconCopy({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function IconPulse({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

function IconArrowRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconAlert({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ─── Reusable Components ───────────────────────────────────────────────────

function Spinner({ size = "h-4 w-4" }) {
  return (
    <svg className={`${size} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function Badge({ success, label }) {
  if (success === undefined || success === null) return null;
  const text = label || (success ? "Resolved" : "Failed");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        success
          ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20"
          : "bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${success ? "bg-emerald-400" : "bg-red-400"}`} />
      {text}
    </span>
  );
}

function StatusCode({ code }) {
  if (!code) return null;
  const isOk = code >= 200 && code < 300;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${
        isOk
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/20 bg-red-500/10 text-red-400"
      }`}
    >
      {code}
    </span>
  );
}

function Card({ title, badge, className = "", children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group rounded-xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm transition-colors hover:border-neutral-700 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-800/60 px-5 py-3.5">
        <h3 className="text-[13px] font-semibold uppercase tracking-widest text-neutral-500">
          {title}
        </h3>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );
}

function CodeBlock({ data, label }) {
  const [copied, setCopied] = useState(false);

  if (data === undefined || data === null) return null;
  const formatted = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);

  function handleCopy() {
    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      {label && <p className="mb-1.5 text-xs font-medium text-neutral-500">{label}</p>}
      <div className="relative">
        <pre className="max-h-72 overflow-auto rounded-lg border border-neutral-800 bg-neutral-950/80 p-4 font-mono text-[13px] leading-relaxed text-neutral-300">
          {formatted}
        </pre>
        <button
          onClick={handleCopy}
          className="absolute right-2 top-2 flex items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-[11px] font-medium text-neutral-400 opacity-0 transition-all hover:border-neutral-600 hover:text-neutral-300 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <IconCheck className="h-3 w-3 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <IconCopy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Pipeline Loader ───────────────────────────────────────────────────────

function PipelineLoader() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let timeout;
    function advanceStep(step) {
      if (step < PIPELINE_STEPS.length - 1) {
        timeout = setTimeout(() => {
          setActiveStep(step + 1);
          advanceStep(step + 1);
        }, PIPELINE_STEPS[step].duration);
      }
    }
    advanceStep(0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-12 flex flex-col items-center"
    >
      <div className="mb-8">
        <Spinner size="h-6 w-6" />
      </div>
      <div className="w-full max-w-sm space-y-1">
        {PIPELINE_STEPS.map((step, i) => {
          const isActive = i === activeStep;
          const isDone = i < activeStep;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 transition-all duration-300 ${
                isActive ? "bg-white/[0.04]" : ""
              }`}
            >
              <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                {isDone ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}>
                    <IconCheck className="h-3.5 w-3.5 text-emerald-400" />
                  </motion.div>
                ) : isActive ? (
                  <Spinner size="h-3.5 w-3.5" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-neutral-700" />
                )}
              </div>
              <span
                className={`text-sm transition-colors duration-300 ${
                  isDone
                    ? "text-neutral-500"
                    : isActive
                      ? "text-neutral-200"
                      : "text-neutral-600"
                }`}
              >
                {step.label}
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="ml-0.5"
                  >
                    ...
                  </motion.span>
                )}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── URL Diff Display ──────────────────────────────────────────────────────

function UrlDiff({ originalUrl, fixedUrl }) {
  if (!originalUrl || !fixedUrl || originalUrl === fixedUrl) return null;

  // Find the differing segment
  const origParts = originalUrl.split("/");
  const fixedParts = fixedUrl.split("/");

  function renderHighlighted(parts, otherParts, color) {
    return parts.map((part, i) => {
      const isDifferent = part !== otherParts[i];
      return (
        <span key={i}>
          {i > 0 && "/"}
          <span className={isDifferent ? `font-semibold ${color}` : "text-neutral-500"}>
            {part}
          </span>
        </span>
      );
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950/60"
    >
      <div className="flex items-center gap-2 border-b border-neutral-800/60 px-4 py-2">
        <IconArrowRight className="h-3.5 w-3.5 text-neutral-500" />
        <span className="text-xs font-medium text-neutral-400">URL Transformation</span>
      </div>
      <div className="space-y-2.5 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded border border-red-500/20 bg-red-500/10 px-1.5 py-px text-[10px] font-bold uppercase text-red-400">
            Before
          </span>
          <code className="break-all font-mono text-[13px] leading-relaxed">
            {renderHighlighted(origParts, fixedParts, "text-red-400")}
          </code>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-px text-[10px] font-bold uppercase text-emerald-400">
            After
          </span>
          <code className="break-all font-mono text-[13px] leading-relaxed">
            {renderHighlighted(fixedParts, origParts, "text-emerald-400")}
          </code>
        </div>
      </div>
    </motion.div>
  );
}

// ─── App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDebug = useCallback(async () => {
    if (!url.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), method }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || `Request failed with status ${res.status}`);
      } else if (data.message) {
        setResult({ success: true, data });
      } else {
        setResult({ success: false, data });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, method, loading]);

  const debugData = result && !result.success ? result.data : null;
  const retrySuccess = debugData?.retryResult?.success;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      {/* ── Background texture ─────────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.03)_0%,_transparent_50%)]" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="relative border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900">
              <IconDebug className="h-4 w-4 text-neutral-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-neutral-100">API Debugger</h1>
              <p className="text-[11px] text-neutral-500">Automatically detect and fix API failures</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            System online
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <main className="relative mx-auto max-w-5xl px-6 py-8">
        {/* Request Panel */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-neutral-500">
              Request
            </p>
            {method && (
              <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-[11px] font-semibold text-neutral-400">
                {method}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="h-10 cursor-pointer rounded-lg border border-neutral-700 bg-neutral-800 px-3 text-sm font-semibold text-neutral-200 outline-none transition hover:border-neutral-600 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
            >
              <option value="GET" className="bg-neutral-800">GET</option>
              <option value="POST" className="bg-neutral-800">POST</option>
            </select>

            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDebug()}
              placeholder="https://api.example.com/v1/resource"
              spellCheck={false}
              className="h-10 flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-4 font-mono text-sm text-neutral-100 placeholder-neutral-600 outline-none transition hover:border-neutral-600 focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
            />

            <button
              onClick={handleDebug}
              disabled={loading || !url.trim()}
              className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-neutral-950 transition-all hover:bg-neutral-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-30"
            >
              {loading ? (
                <>
                  <Spinner />
                  Debugging...
                </>
              ) : (
                "Debug"
              )}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Error State */}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-5 py-4"
            >
              <IconAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <div>
                <p className="text-sm font-medium text-red-400">Connection Error</p>
                <p className="mt-0.5 text-sm text-red-400/70">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!result && !error && !loading && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-20 text-center"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900">
                <IconPulse className="h-6 w-6 text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-400">Enter an API endpoint and click Debug to start</p>
              <p className="mt-1.5 text-xs text-neutral-600">
                The pipeline will execute, analyze, fix, and retry your request automatically
              </p>
            </motion.div>
          )}

          {/* Loading — Pipeline Steps */}
          {loading && <PipelineLoader key="loader" />}

          {/* Success (direct — no error pipeline) */}
          {result?.success && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5"
            >
              <Card title="Response" badge={<Badge success={true} label="Success" />}>
                <p className="mb-3 text-sm text-neutral-300">{result.data.message}</p>
                <CodeBlock data={result.data.data} />
              </Card>
            </motion.div>
          )}

          {/* Debug Results */}
          {debugData && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 space-y-6"
            >
              {/* URL Diff */}
              <UrlDiff originalUrl={debugData.originalUrl} fixedUrl={debugData.fixedUrl} />

              {/* Fixed URL Banner */}
              {debugData.fixedUrl && debugData.originalUrl !== debugData.fixedUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/60 px-4 py-3"
                >
                  <span className="text-xs font-medium text-neutral-500">Fixed URL</span>
                  <code className="flex-1 break-all font-mono text-sm text-emerald-400">
                    {debugData.fixedUrl}
                  </code>
                </motion.div>
              )}

              {/* 2x2 Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Initial Error — top left */}
                <Card
                  title="Initial Error"
                  badge={<Badge success={debugData.initialError?.success} />}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <StatusCode code={debugData.initialError?.status} />
                    <span className="text-xs text-neutral-500">Status Code</span>
                  </div>
                  <CodeBlock data={debugData.initialError?.error} />
                </Card>

                {/* Evaluation — top right */}
                <Card title="Evaluation">
                  <div className="flex flex-col items-center justify-center py-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                      className={`mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                        retrySuccess
                          ? "glow-success bg-emerald-500/10 ring-1 ring-emerald-500/25"
                          : "bg-red-500/10 ring-1 ring-red-500/25"
                      }`}
                    >
                      {retrySuccess ? (
                        <IconCheck className="h-7 w-7 text-emerald-400" />
                      ) : (
                        <IconX className="h-7 w-7 text-red-400" />
                      )}
                    </motion.div>
                    <Badge success={retrySuccess} />
                    <p className="mt-3 text-center text-sm text-neutral-400">
                      {debugData.evaluation}
                    </p>
                  </div>
                </Card>

                {/* Analysis — full width */}
                <Card title="Analysis" className="col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
                      <dt className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                        Issue Detected
                      </dt>
                      <dd className="text-sm leading-relaxed text-neutral-200">
                        {debugData.analysis?.issue || "---"}
                      </dd>
                    </div>
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4">
                      <dt className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
                        Suggested Fix
                      </dt>
                      <dd className="text-sm leading-relaxed text-neutral-200">
                        {debugData.analysis?.suggestion || "---"}
                      </dd>
                    </div>
                  </div>
                </Card>

                {/* Retry Result — full width */}
                <Card
                  title="Retry Result"
                  badge={<Badge success={debugData.retryResult?.success} />}
                  className="col-span-2"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <StatusCode code={debugData.retryResult?.status} />
                    <span className="text-xs text-neutral-500">Status Code</span>
                  </div>
                  <CodeBlock
                    data={debugData.retryResult?.data || debugData.retryResult?.error}
                    label="Response Body"
                  />
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
