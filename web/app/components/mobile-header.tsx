import { Link } from "react-router";

export function MobileHeader({
  memberName,
}: {
  memberName?: string | null;
}) {
  return (
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
          <button className="font-mono text-accent text-base leading-none">
            ⌕
          </button>
          <Link
            to="/organizers"
            className="font-mono text-[10.5px] font-semibold text-muted tracking-wide uppercase"
          >
            For Organizers
          </Link>
        </div>
      </div>
    </div>
  );
}
