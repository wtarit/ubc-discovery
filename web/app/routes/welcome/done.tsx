import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
  OnboardingTop,
  OnboardingFooter,
  OnboardingDesktopShell,
} from "~/components/OnboardingShell";
import { ApiError } from "~/lib/api";
import { useAuth } from "~/lib/auth";
import {
  clearOnboardingDraft,
  readOnboardingDraft,
  type OnboardingDraft,
} from "~/lib/onboarding";
import { consumeAuthReturnTo } from "~/lib/auth-flow";

export function meta() {
  return [{ title: "You're in! — UBC Discovery" }];
}

const NEXT_STEPS = [
  ["Browse the feed", "Find something you want to go to"],
  ["Save events with ♡", "They land in your shortlist"],
  ["Rate events you went to", "Quietly improves your For you"],
] as const;

function StepList() {
  return (
    <ol className="m-0 p-0 list-none flex flex-col gap-2.5">
      {NEXT_STEPS.map(([title, desc], i) => (
        <li key={title} className="flex gap-2.5">
          <span className="w-5 h-5 bg-ink text-bg shrink-0 flex items-center justify-center font-mono text-[11px] font-bold md:w-7 md:h-7 md:text-[13px]">
            {i + 1}
          </span>
          <div>
            <div className="font-display font-bold text-base text-ink tracking-tight md:text-[19px]">
              {title}
            </div>
            <div className="text-[12.5px] text-ink-soft mt-0.5 md:text-[13.5px]">
              {desc}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function OnboardingDone() {
  const navigate = useNavigate();
  const { completeOnboarding, refreshProfile, state } = useAuth();
  const uid =
    state.status === "onboarding" || state.status === "member"
      ? state.uid
      : null;
  const profile = state.status === "member" ? state.profile : null;
  const [draft, setDraft] = useState<OnboardingDraft>({});
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState("");
  const name = profile?.preferred_name ?? draft.preferred_name ?? "there";

  useEffect(() => {
    if (uid) {
      setDraft(readOnboardingDraft(uid));
      setDraftLoaded(true);
    }
  }, [uid]);

  useEffect(() => {
    if (state.status === "loading") return;
    if (state.status === "anonymous") {
      navigate("/sign-in", { replace: true });
      return;
    }
    if (!draftLoaded) return;
    if (profile) {
      clearOnboardingDraft(uid);
      setSaving(false);
      return;
    }
    if (!draft.preferred_name) {
      navigate("/welcome/name", { replace: true });
      return;
    }

    let cancelled = false;
    async function save() {
      setSaving(true);
      setError("");
      try {
        await completeOnboarding({
          preferred_name: draft.preferred_name!,
          major: draft.major,
          year_standing: draft.year_standing,
          faculty: draft.faculty,
          interests: draft.interests,
        });
        clearOnboardingDraft(uid);
      } catch (e: any) {
        if (e instanceof ApiError && e.status === 409) {
          await refreshProfile();
          clearOnboardingDraft(uid);
        } else if (!cancelled) {
          setError(e.message);
        }
      } finally {
        if (!cancelled) setSaving(false);
      }
    }

    save();
    return () => {
      cancelled = true;
    };
  }, [
    completeOnboarding,
    draft,
    draftLoaded,
    navigate,
    profile,
    refreshProfile,
    state.status,
    uid,
  ]);

  function handleContinue() {
    if (saving || error) return;
    navigate(consumeAuthReturnTo());
  }

  return (
    <div className="min-h-screen bg-bg text-ink font-body">
      {/* Mobile */}
      <div className="md:hidden pb-28">
        <OnboardingTop step={4} total={4} />
        <div className="px-[22px] pt-10">
          <div className="w-[60px] h-[60px] bg-accent text-white flex items-center justify-center font-display font-extrabold text-[28px] mb-5">
            ✓
          </div>
          <h1 className="font-display font-extrabold text-[44px] text-ink tracking-tighter leading-[0.92]">
            You&rsquo;re in,
            <br />
            <span className="text-accent">{name}.</span>
          </h1>
          <p className="mt-3.5 text-[14.5px] text-ink-soft leading-relaxed">
            {saving
              ? "Finishing your profile setup..."
              : error
                ? error
                : "Your For you feed is ranked for what you picked. We'll keep tuning it as you save events and rate ones you went to."}
          </p>

          <div className="mt-5 p-4 border border-ink bg-surface">
            <div className="font-mono text-[10px] text-muted tracking-wide uppercase">
              What&rsquo;s next
            </div>
            <div className="mt-2.5">
              <StepList />
            </div>
          </div>
        </div>
        <OnboardingFooter
          canContinue={!saving && !error}
          onContinue={handleContinue}
          ctaLabel={saving ? "Finishing setup" : error ? "Setup needs attention" : "Take me to Discover"}
        />
      </div>

      {/* Desktop */}
      <OnboardingDesktopShell
        step={4}
        total={4}
        kicker="All set"
        title={
          <>
            You&rsquo;re in,
            <br />
            <span className="text-accent">{name}.</span>
          </>
        }
        subtitle={
          <>
            {saving
              ? "Finishing your profile setup..."
              : error
                ? error
                : "Your For you feed is ranked for what you picked. We'll keep tuning it as you save events and rate ones you went to."}
          </>
        }
        canContinue={!saving && !error}
        ctaLabel={saving ? "Finishing setup" : error ? "Setup needs attention" : "Take me to Discover"}
        onContinue={handleContinue}
      >
        <StepList />
      </OnboardingDesktopShell>
    </div>
  );
}
