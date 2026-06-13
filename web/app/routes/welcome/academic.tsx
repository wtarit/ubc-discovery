import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { FACULTIES, YEARS } from "~/lib/constants";
import {
  OnboardingTop,
  OnboardingFooter,
  OnboardingDesktopShell,
} from "~/components/OnboardingShell";
import { useAuth } from "~/lib/auth";
import {
  mergeOnboardingDraft,
  readOnboardingDraft,
  yearLabelToStanding,
  yearStandingToLabel,
} from "~/lib/onboarding";

export function meta() {
  return [{ title: "Academic context — UBC Discovery" }];
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <div className="font-mono text-[10px] text-muted tracking-wider uppercase mb-1.5">
        {label}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3.5 py-3.5 border border-ink bg-surface font-display text-lg font-bold text-ink appearance-none cursor-pointer tracking-tight outline-none"
        >
          <option value="">Select...</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <span className="absolute right-3.5 top-4.5 text-muted pointer-events-none font-mono">
          ▾
        </span>
      </div>
    </div>
  );
}

function PillGrid({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 border border-ink">
      {options.map((opt, i) => {
        const on = value === opt;
        const isLastRow = i >= options.length - (options.length % 2 || 2);
        const isLastCol = (i + 1) % 2 === 0;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`py-2.5 px-3 border-none text-left font-display font-bold text-sm tracking-tight cursor-pointer ${
              on ? "bg-ink text-bg" : "bg-transparent text-ink"
            } ${!isLastCol ? "border-r border-r-ink" : ""} ${
              !isLastRow ? "border-b border-b-ink" : ""
            }`}
            style={{
              borderRight: !isLastCol ? "1px solid var(--color-ink)" : "none",
              borderBottom: !isLastRow ? "1px solid var(--color-ink)" : "none",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function OnboardingAcademic() {
  const navigate = useNavigate();
  const { loading, profile, uid } = useAuth();
  const draft = readOnboardingDraft(uid);
  const [faculty, setFaculty] = useState(draft.faculty ?? "");
  const [major, setMajor] = useState(draft.major ?? "");
  const [year, setYear] = useState(yearStandingToLabel(draft.year_standing));

  useEffect(() => {
    if (loading) return;
    if (profile) navigate("/", { replace: true });
    if (!uid) navigate("/sign-in", { replace: true });
    if (!readOnboardingDraft(uid).preferred_name) navigate("/welcome/name", { replace: true });
  }, [loading, navigate, profile, uid]);

  function handleContinue() {
    mergeOnboardingDraft(uid, {
      faculty: faculty || undefined,
      major: major.trim() || undefined,
      year_standing: yearLabelToStanding(year),
    });
    navigate("/welcome/interests");
  }

  function handleSkip() {
    navigate("/welcome/interests");
  }

  return (
    <div className="min-h-screen bg-bg text-ink font-body">
      {/* Mobile */}
      <div className="md:hidden pb-32">
        <OnboardingTop
          step={2}
          total={4}
          onBack={() => navigate("/welcome/name")}
        />
        <div className="px-[22px] pt-6 pb-4">
          <div className="font-mono text-[10px] text-accent font-bold tracking-wide uppercase">
            Optional · skippable
          </div>
          <h1 className="mt-1.5 mb-2 font-display font-extrabold text-[34px] text-ink tracking-tight leading-none">
            Where are you
            <br />
            in your degree?
          </h1>
          <p className="text-[13.5px] text-ink-soft leading-relaxed">
            This helps us rank first-year, upper-year, and faculty-specific
            events more appropriately.
          </p>

          <div className="mt-5 space-y-4">
            <SelectField
              label="Faculty"
              value={faculty}
              onChange={setFaculty}
              options={FACULTIES}
            />
            <div>
              <div className="font-mono text-[10px] text-muted tracking-wider uppercase mb-1.5 flex justify-between">
                <span>Major or program</span>
                <span>Free text</span>
              </div>
              <input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Cognitive Systems, Mechanical Engineering"
                className="w-full px-3.5 py-3 border border-ink bg-surface font-body text-[14.5px] text-ink outline-none"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] text-muted tracking-wider uppercase mb-2">
                Year standing
              </div>
              <PillGrid options={YEARS} value={year} onChange={setYear} />
            </div>
          </div>
        </div>
        <OnboardingFooter
          canContinue
          onSkip={handleSkip}
          onContinue={handleContinue}
          detail="You can edit any of this later on your profile"
        />
      </div>

      {/* Desktop */}
      <OnboardingDesktopShell
        step={2}
        total={4}
        kicker="Optional · skippable"
        title={
          <>
            Where are you
            <br />
            in your degree?
          </>
        }
        subtitle="This helps us rank first-year, upper-year, and faculty-specific events more appropriately."
        canContinue
        onSkip={handleSkip}
        onBack={() => navigate("/welcome/name")}
        ctaLabel="Continue"
        onContinue={handleContinue}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Faculty"
              value={faculty}
              onChange={setFaculty}
              options={FACULTIES}
            />
            <SelectField
              label="Year"
              value={year}
              onChange={setYear}
              options={YEARS}
            />
          </div>
          <div>
            <div className="font-mono text-[10px] text-muted tracking-wider uppercase mb-1.5">
              Major or program
            </div>
            <input
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Cognitive Systems"
              className="w-full px-3 py-2.5 border border-ink bg-surface font-body text-sm text-ink outline-none"
            />
          </div>
        </div>
      </OnboardingDesktopShell>
    </div>
  );
}
