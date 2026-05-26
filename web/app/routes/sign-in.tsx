import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "~/lib/api";

export function meta() {
  return [{ title: "Sign In — UBC Discovery" }];
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18">
      <path
        d="M17.6 9.2c0-.6-.1-1.2-.2-1.7H9v3.3h4.8c-.2 1.1-.8 2.1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H1v2.3C2.5 15.9 5.5 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.9 10.7C3.7 10.2 3.6 9.6 3.6 9s.1-1.2.3-1.7V5H1C.4 6.2 0 7.6 0 9s.4 2.8 1 4l2.9-2.3z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.6c1.3 0 2.5.5 3.5 1.4L15 2.4C13.5 1 11.4 0 9 0 5.5 0 2.5 2.1 1 5l2.9 2.3C4.6 5.1 6.6 3.6 9 3.6z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp() {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.auth.sendOtp(email);
      setStep("code");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.auth.verifyOtp(email, code);
      if (res.is_new_user) {
        navigate("/welcome/name");
      } else {
        navigate("/");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-ink font-body">
      {/* Mobile */}
      <div className="md:hidden">
        <div className="border-b-2 border-ink">
          <div className="px-[18px] py-2 flex items-baseline gap-2">
            <Link to="/" className="flex items-baseline gap-2">
              <span className="px-1.5 py-0.5 bg-ink text-bg font-mono text-[11px] font-bold tracking-wider">
                UBC
              </span>
              <span className="font-display text-[17px] font-bold text-ink tracking-tight">
                DISCOVERY
              </span>
            </Link>
          </div>
        </div>

        <div className="px-[22px] pt-7">
          <div className="font-mono text-[10px] text-accent font-bold tracking-wider uppercase">
            Join UBC Discovery
          </div>
          <h1 className="mt-2 font-display font-extrabold text-5xl text-ink tracking-tighter leading-[0.92]">
            Sign in
            <br />
            to make it
            <br />
            yours.
          </h1>
          <p className="mt-3.5 text-[14.5px] text-ink-soft leading-relaxed">
            Save events. Rate them. Unlock the re-ranked For You feed.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button className="py-3.5 border border-ink bg-bg text-ink cursor-pointer flex items-center justify-center gap-2.5 font-mono text-[11px] font-bold tracking-wider uppercase">
              <GoogleIcon />
              CONTINUE WITH GOOGLE
            </button>
            <div className="font-mono text-[10px] text-muted tracking-wider uppercase my-1.5 text-center">
              — OR —
            </div>

            {step === "email" ? (
              <>
                <label className="font-mono text-[10px] text-muted tracking-wide uppercase">
                  EMAIL
                </label>
                <input
                  type="email"
                  placeholder="you@anywhere.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3.5 py-3 border border-ink bg-surface font-mono text-[13px] text-ink outline-none"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="py-3.5 border border-accent bg-accent text-white cursor-pointer font-mono text-[11px] font-bold tracking-wider uppercase disabled:opacity-50"
                >
                  {loading ? "SENDING..." : "SEND SIGN-IN CODE →"}
                </button>
              </>
            ) : (
              <>
                <label className="font-mono text-[10px] text-muted tracking-wide uppercase">
                  VERIFICATION CODE
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="px-3.5 py-3 border border-ink bg-surface font-mono text-[13px] text-ink outline-none tracking-[0.5em] text-center"
                  maxLength={6}
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="py-3.5 border border-accent bg-accent text-white cursor-pointer font-mono text-[11px] font-bold tracking-wider uppercase disabled:opacity-50"
                >
                  {loading ? "VERIFYING..." : "VERIFY →"}
                </button>
                <button
                  onClick={() => setStep("email")}
                  className="font-mono text-[11px] text-muted tracking-wide uppercase bg-transparent border-none cursor-pointer"
                >
                  ← Use a different email
                </button>
              </>
            )}

            {error && (
              <p className="text-[12px] text-[#D63A2E] font-mono">{error}</p>
            )}
          </div>

          <div className="mt-7 p-3 border border-dashed border-ink text-xs text-muted leading-relaxed">
            An independent student project for the UBC community. Not affiliated
            with UBC.
          </div>
        </div>
      </div>

      {/* Desktop — split layout */}
      <div className="hidden md:grid grid-cols-[5fr_7fr] min-h-screen">
        <aside className="bg-ink text-bg p-8 flex flex-col relative overflow-hidden">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-[30px] h-[30px] bg-bg text-ink flex items-center justify-center font-display font-extrabold text-sm tracking-tight">
              UBC
            </div>
            <span className="font-display font-extrabold text-xl tracking-tight">
              DISCOVERY
            </span>
          </Link>

          <h2 className="mt-10 font-display font-extrabold text-[56px] text-bg tracking-tighter leading-none">
            One place.
            <br />
            Every event on campus.
          </h2>
          <p className="mt-3.5 text-[15px] text-bg opacity-70 leading-relaxed max-w-[380px]">
            UBC Discovery pulls events from official UBC channels, AMS clubs,
            and community organizers — filterable by what you&rsquo;re into.
          </p>

          <div className="mt-auto pt-6 font-mono text-[11px] text-bg opacity-50 tracking-wide uppercase">
            You can change all of this on your profile later
          </div>
        </aside>

        <main className="p-8 px-14 flex flex-col">
          <div className="flex-1 max-w-[520px]">
            <div className="font-mono text-[10px] text-accent font-bold tracking-wide uppercase">
              Sign in
            </div>
            <h1 className="mt-2 mb-2 font-display font-extrabold text-[46px] text-ink tracking-tighter leading-none">
              Sign in to save events,
              <br />
              rate them, and tune your feed.
            </h1>

            <div className="mt-7 flex flex-col gap-3.5">
              <button className="py-3.5 border border-ink bg-bg text-ink cursor-pointer flex items-center justify-center gap-2.5 font-mono text-xs font-bold tracking-wide uppercase">
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="font-mono text-[10px] text-muted tracking-wider uppercase my-1 text-center flex items-center gap-2.5">
                <span className="flex-1 h-px bg-rule-soft" />
                or
                <span className="flex-1 h-px bg-rule-soft" />
              </div>

              {step === "email" ? (
                <>
                  <div>
                    <label className="font-mono text-[10px] text-muted tracking-wider uppercase mb-1.5 block">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2.5 border border-ink bg-surface font-body text-sm text-ink outline-none"
                    />
                  </div>
                  <div className="text-xs text-muted">
                    We&rsquo;ll send you a sign-in code.
                  </div>
                  <div className="flex justify-end mt-3 pt-5 border-t border-rule-soft">
                    <button
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="px-6 py-3 border border-accent bg-accent text-white cursor-pointer font-mono text-[11px] font-bold tracking-wide uppercase disabled:opacity-50"
                    >
                      {loading ? "Sending..." : "Continue with email →"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="font-mono text-[10px] text-muted tracking-wider uppercase mb-1.5 block">
                      Verification code sent to {email}
                    </label>
                    <input
                      type="text"
                      placeholder="123456"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-3 py-2.5 border border-ink bg-surface font-mono text-lg text-ink outline-none tracking-[0.5em] text-center"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-5 border-t border-rule-soft">
                    <button
                      onClick={() => setStep("email")}
                      className="font-mono text-[11px] text-muted font-bold tracking-wide uppercase bg-transparent border-none cursor-pointer"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="px-6 py-3 border border-accent bg-accent text-white cursor-pointer font-mono text-[11px] font-bold tracking-wide uppercase disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify →"}
                    </button>
                  </div>
                </>
              )}

              {error && (
                <p className="text-[12px] text-[#D63A2E] font-mono">{error}</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
