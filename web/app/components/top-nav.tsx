import { Link, NavLink } from "react-router";

const NAV_ITEMS = [
  { id: "discover", label: "Discover", to: "/" },
  { id: "saved", label: "Saved", to: "/saved" },
  { id: "organizers", label: "For Organizers", to: "/organizers" },
];

export function TopNav({
  memberName,
}: {
  memberName?: string | null;
}) {
  return (
    <header className="hidden md:flex px-8 py-5 border-b-2 border-ink items-center justify-between bg-bg">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-[30px] h-[30px] bg-ink text-bg flex items-center justify-center font-display font-extrabold text-sm tracking-tight">
            UBC
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight">
            DISCOVERY
          </span>
        </Link>
        <nav className="flex gap-5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `font-mono text-[11px] font-semibold tracking-wide uppercase pb-1 border-b-2 ${
                  isActive
                    ? "text-ink border-accent"
                    : "text-muted border-transparent"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <div className="px-3 py-1.5 pl-8 border border-ink font-mono text-[11.5px] text-muted tracking-wide uppercase relative min-w-[260px] bg-surface">
          <span className="absolute left-3 top-1.5 font-mono text-accent">
            ⌕
          </span>
          Search · ⌘K
        </div>
        {memberName ? (
          <Link to="/profile" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-accent to-[#7990FF] flex items-center justify-center text-white font-display font-extrabold text-[13px]">
              {memberName[0]?.toUpperCase()}
            </div>
            <span className="font-mono text-[11px] font-semibold">
              {memberName}
            </span>
          </Link>
        ) : (
          <Link
            to="/sign-in"
            className="px-4 py-2 border border-ink bg-ink text-bg font-mono text-[11px] font-bold tracking-wide uppercase"
          >
            Sign in →
          </Link>
        )}
      </div>
    </header>
  );
}
