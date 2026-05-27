import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "~/lib/auth";
import {
  useSavedEventIds,
  useSavedEventMutations,
} from "~/lib/saved-events-query";

type SaveEventButtonProps = {
  eventId: string;
  variant?: "icon" | "bar" | "wide";
  className?: string;
};

const variantClasses = {
  icon: "w-8 h-8 p-0 text-[15px]",
  bar: "px-3.5 py-3 text-[11px]",
  wide: "w-full py-3.5 text-[11px]",
};

export function SaveEventButton({
  eventId,
  variant = "icon",
  className = "",
}: SaveEventButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, profile } = useAuth();
  const { data: savedEventIds } = useSavedEventIds();
  const { save, unsave, pending } = useSavedEventMutations();
  const [failed, setFailed] = useState(false);
  const saved = savedEventIds.has(eventId);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (!token || !profile) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/sign-in?redirect=${redirect}`);
      return;
    }

    setFailed(false);
    try {
      if (saved) {
        await unsave.mutateAsync(eventId);
      } else {
        await save.mutateAsync(eventId);
      }
    } catch {
      setFailed(true);
    }
  }

  const text =
    variant === "icon"
      ? saved
        ? "♥"
        : "♡"
      : variant === "bar"
        ? pending
          ? "..."
          : saved
            ? "♥ SAVED"
            : "♡ SAVE"
        : pending
          ? "SAVING..."
          : saved
            ? "♥ SAVED TO SHORTLIST"
            : "♡ SAVE TO SHORTLIST";

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved events" : "Save event"}
      title={failed ? "Save failed. Try again." : saved ? "Remove from saved events" : "Save event"}
      onClick={handleClick}
      disabled={pending}
      className={`inline-flex items-center justify-center border font-mono font-bold tracking-wider uppercase cursor-pointer disabled:opacity-60 ${
        saved
          ? "border-accent bg-accent text-white"
          : "border-ink bg-bg text-ink"
      } ${variantClasses[variant]} ${className}`}
    >
      {text}
    </button>
  );
}
