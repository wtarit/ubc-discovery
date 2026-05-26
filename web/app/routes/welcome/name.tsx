import { useState } from "react";
import { useNavigate } from "react-router";
import {
  OnboardingTop,
  OnboardingFooter,
  OnboardingDesktopShell,
} from "~/components/onboarding-shell";

export function meta() {
  return [{ title: "What should we call you? — UBC Discovery" }];
}

export default function OnboardingName() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const canContinue = name.trim().length > 0;

  function handleContinue() {
    if (!canContinue) return;
    navigate("/welcome/academic", { state: { name: name.trim() } });
  }

  return (
    <div className="min-h-screen bg-bg text-ink font-body">
      {/* Mobile */}
      <div className="md:hidden pb-28">
        <OnboardingTop step={1} total={4} />
        <div className="px-[22px] pt-8">
          <div className="font-mono text-[10px] text-accent font-bold tracking-wide uppercase">
            A few quick things
          </div>
          <h1 className="mt-2 mb-2 font-display font-extrabold text-[38px] text-ink tracking-tight leading-none">
            What should we call you?
          </h1>

          <div className="mt-6">
            <div className="font-mono text-[10px] text-muted tracking-wider uppercase mb-2">
              Preferred name
            </div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What your friends call you"
              className="w-full px-3.5 py-4 border border-ink bg-surface font-display text-[22px] font-bold text-ink tracking-tight outline-none"
            />
          </div>
        </div>
        <OnboardingFooter canContinue={canContinue} onContinue={handleContinue} />
      </div>

      {/* Desktop */}
      <OnboardingDesktopShell
        step={1}
        total={4}
        kicker="A few quick things"
        title="What should we call you?"
        sideTitle={
          <>
            Welcome.
            <br />
            Let&rsquo;s set you up.
          </>
        }
        sideBody="This takes about a minute. We use what you tell us to rank your For you feed."
        canContinue={canContinue}
        ctaLabel="Continue"
        onContinue={handleContinue}
      >
        <div>
          <div className="font-mono text-[10px] text-muted tracking-wider uppercase mb-1.5">
            Preferred name
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What your friends call you"
            className="w-full px-3.5 py-3 border border-ink bg-surface font-display text-[22px] font-bold text-ink tracking-tight outline-none"
          />
        </div>
      </OnboardingDesktopShell>
    </div>
  );
}
