import { useState } from "react";
import { Link } from "react-router";
import { AccountMenu } from "~/components/AccountMenu";
import { SearchOverlay } from "~/components/SearchOverlay";
import { useTheme } from "~/lib/theme";

export function MobileHeader({
  memberName,
}: {
  memberName?: string | null;
}) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <div className="border-b-2 border-ink md:hidden">
        <div className="px-[18px] py-2 flex justify-between items-baseline">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="px-1.5 py-0.5 bg-ink text-bg font-mono text-[11px] font-bold tracking-wider">
              UBC
            </span>
            <span className="font-display text-[17px] font-bold text-ink tracking-tight">
              DISCOVERY
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(true)}
              className="font-mono text-accent text-base leading-none cursor-pointer"
            >
              ⌕
            </button>
            <button
              onClick={toggleTheme}
              className="font-mono text-muted text-base leading-none"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? "☀" : "☾"}
            </button>
            {memberName && <AccountMenu memberName={memberName} compact />}
            <Link
              to="/organizers"
              className="font-mono text-[10.5px] font-semibold text-muted tracking-wide uppercase"
            >
              For Organizers
            </Link>
          </div>
        </div>
      </div>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
