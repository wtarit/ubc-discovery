import { Link, NavLink } from "react-router";
import { AccountMenu } from "~/components/AccountMenu";
import { useTheme } from "~/lib/theme";

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
  const { resolvedTheme, toggleTheme } = useTheme();
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
        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center border border-rule-soft text-muted hover:text-ink hover:border-ink transition-colors"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? "☀" : "☾"}
        </button>
        {memberName ? (
          <AccountMenu memberName={memberName} />
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
