import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { admin, isUnauthorized } from "../lib/admin";
import { useToast } from "../components/Toast";
import { cx } from "../lib/cx";

type Status = "idle" | "busy" | "success";

export function Login({ onDone, onHome }: { onDone: () => void; onHome: () => void }) {
  const toast = useToast();
  const [token, setToken] = useState("");
  const [reveal, setReveal] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [capsLock, setCapsLock] = useState(false);

  useEffect(() => {
    admin
      .session()
      .then(onDone)
      .catch((cause) => {
        if (!isUnauthorized(cause)) setError(cause instanceof Error ? cause.message : "Cannot reach the API");
      });
  }, [onDone]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (status !== "idle" || token.trim() === "") return;
    setStatus("busy");
    setError(null);
    try {
      await admin.login(token.trim());
      setStatus("success");
      toast("Signed in");
      setTimeout(onDone, 780);
    } catch (cause) {
      setStatus("idle");
      setError(cause instanceof Error ? cause.message : "Sign in failed");
      setAttempt((value) => value + 1);
    }
  };

  const readModifiers = (event: KeyboardEvent<HTMLInputElement>) => {
    if (typeof event.getModifierState === "function") setCapsLock(event.getModifierState("CapsLock"));
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="animate-float absolute -left-32 -top-32 size-[420px] rounded-full opacity-70 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--accent-soft), transparent 70%)" }}
        />
        <div
          className="animate-float-slow absolute -bottom-40 -right-24 size-[460px] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(48, 209, 88, 0.16), transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(var(--label) 1px, transparent 1px), linear-gradient(90deg, var(--label) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
            maskImage: "radial-gradient(65% 55% at 50% 40%, black, transparent)",
            WebkitMaskImage: "radial-gradient(65% 55% at 50% 40%, black, transparent)",
          }}
        />
      </div>

      <header className="mx-auto w-full max-w-[520px] px-5 pt-[max(env(safe-area-inset-top),1.1rem)]">
        <button
          type="button"
          onClick={onHome}
          className="glass inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[12.5px] font-medium text-secondary transition hover:text-label"
        >
          <ArrowLeft className="size-3.5" /> Back
        </button>
      </header>

      <main className="mx-auto flex w-full max-w-[520px] flex-1 items-center px-5 pb-16 pt-8">
        <div className="animate-rise glass min-h-[356px] w-full rounded-[26px] border border-hairline p-6 card-shadow sm:min-h-[372px] sm:p-7">
          {status === "success" ? (
            <div className="flex h-full flex-col items-center justify-center py-6 text-center">
              <span className="animate-pop relative flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
                <Check className="size-8" strokeWidth={2.6} />
                <span className="animate-ring absolute inset-0 rounded-full border border-success/40" />
              </span>
              <div className="mt-5 text-[19px] font-semibold tracking-tight">Signed in</div>
              <div className="mt-1 text-[13px] text-secondary">Opening dashboard…</div>
              <div className="mt-6 h-1 w-36 overflow-hidden rounded-full bg-hairline">
                <div className="login-progress h-full w-full origin-left rounded-full bg-success" />
              </div>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="flex items-start justify-between">
                <span className="flex size-11 items-center justify-center rounded-[13px] bg-accent text-white shadow-[0_10px_24px_-12px_var(--accent)]">
                  <Mail className="size-5" strokeWidth={2.2} />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-canvas px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-secondary">
                  <ShieldCheck className="size-3" /> Admin only
                </span>
              </div>

              <h1 className="mt-4 text-[22px] font-semibold tracking-tight">Sign in</h1>

              <label className="mt-5 block">
                <span className="mb-1.5 block px-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-secondary">
                  Admin token
                </span>
                <div
                  className={cx(
                    "flex items-center rounded-xl border bg-canvas transition-all duration-200",
                    error ? "border-danger/60" : "border-hairline focus-within:border-accent focus-within:ring-4 focus-within:ring-accent/10",
                  )}
                >
                  <KeyRound className="ml-3 size-4 shrink-0 text-tertiary" />
                  <input
                    value={token}
                    onChange={(event) => setToken(event.target.value)}
                    onKeyDown={readModifiers}
                    onKeyUp={readModifiers}
                    type={reveal ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="paste token"
                    spellCheck={false}
                    className="min-w-0 flex-1 bg-transparent px-2.5 py-2.5 font-mono text-[13px] outline-none placeholder:font-sans placeholder:text-tertiary"
                  />
                  <button
                    type="button"
                    aria-label={reveal ? "Hide token" : "Show token"}
                    onClick={() => setReveal((value) => !value)}
                    className="mr-1 rounded-full p-1.5 text-secondary transition hover:text-label"
                  >
                    {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </label>

              <div className="min-h-[20px] px-1 pt-1.5">
                {error ? (
                  <p key={attempt} className="animate-shake text-[12.5px] text-danger">
                    {error}
                  </p>
                ) : capsLock ? (
                  <p className="text-[12px] text-warning">Caps Lock is on</p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={status === "busy" || token.trim() === ""}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-[15px] font-semibold text-white shadow-[0_12px_28px_-16px_var(--accent)] transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {status === "busy" ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                {status === "busy" ? "Signing in…" : "Sign in"}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-tertiary">
                <Lock className="size-3" />
                Session lasts 7 days
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
