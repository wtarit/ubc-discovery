import { useState, useMemo } from "react";
import { useLoaderData } from "react-router";
import type { Route } from "./+types/discover";
import { api, type ApiEvent } from "~/lib/api";
import { VIBES, SOURCES, type VibeId, type SourceId } from "~/lib/constants";
import { VibeTag } from "~/components/VibeTag";
import { EventCardMedium, EventCardCompact, EventCardRich } from "~/components/EventCard";
import { useAuth } from "~/lib/auth";

export function meta() {
  return [
    { title: "Discover — UBC Discovery" },
    { name: "description", content: "Find events happening on campus" },
  ];
}

export async function clientLoader() {
  const data = await api.events.list(0, 100);
  return data;
}

type Tab = "all" | "for-you";

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 border font-mono text-[10.5px] font-semibold tracking-wide uppercase cursor-pointer whitespace-nowrap shrink-0 ${
        active
          ? "border-accent bg-accent text-white"
          : "border-ink bg-transparent text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 px-[18px] py-2 overflow-x-auto border-b border-rule-soft">
      <span className="font-mono text-[10px] text-muted tracking-wider shrink-0">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="font-mono text-[10px] text-ink tracking-wider uppercase mb-2.5 pb-1 border-b border-ink">
        {label}
      </div>
      {children}
    </div>
  );
}

function RowSelect({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`py-1 cursor-pointer font-mono text-[11.5px] tracking-wide flex items-center gap-2 ${
        active ? "font-bold text-ink" : "font-normal text-muted"
      }`}
    >
      <span className={`w-3 ${active ? "text-accent" : "text-transparent"}`}>
        →
      </span>
      <span>{label}</span>
    </div>
  );
}

type SortMode = "upcoming" | "newest" | "a-z";

const SORT_OPTIONS: { id: SortMode; label: string }[] = [
  { id: "upcoming", label: "Upcoming" },
  { id: "newest", label: "Recently added" }
];

function sortEvents(events: ApiEvent[], mode: SortMode): ApiEvent[] {
  const sorted = [...events];
  switch (mode) {
    case "upcoming":
      return sorted.sort((a, b) => {
        const da = a.event_date ? new Date(a.event_date).getTime() : Infinity;
        const db = b.event_date ? new Date(b.event_date).getTime() : Infinity;
        return da - db;
      });
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "a-z":
      return sorted.sort((a, b) =>
        a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
      );
  }
}

export default function Discover() {
  const data = useLoaderData<typeof clientLoader>();
  const { state } = useAuth();
  const isMember = state.status === "member";
  const [tab, setTab] = useState<Tab>("all");
  const [forYouEvents, setForYouEvents] = useState<ApiEvent[] | null>(null);
  const [forYouLoading, setForYouLoading] = useState(false);
  const [activeVibe, setActiveVibe] = useState<VibeId | null>(null);
  const [activeSource, setActiveSource] = useState<SourceId>("all");
  const [density] = useState<"compact" | "medium" | "rich">("medium");
  const [sortBy, setSortBy] = useState<SortMode>("upcoming");

  async function handleTabChange(next: Tab) {
    setTab(next);
    if (next === "for-you" && forYouEvents === null && !forYouLoading) {
      setForYouLoading(true);
      try {
        const res = await api.recommendations.forYou(20);
        setForYouEvents(res.events);
      } catch {
        setForYouEvents([]);
      } finally {
        setForYouLoading(false);
      }
    }
  }

  const events = useMemo(() => {
    let filtered: ApiEvent[] = data?.events ?? [];
    if (activeVibe) filtered = filtered.filter((e) => e.vibes.includes(activeVibe));
    if (activeSource !== "all")
      filtered = filtered.filter((e) => e.source_label === activeSource);
    return sortEvents(filtered, sortBy);
  }, [data, activeVibe, activeSource, sortBy]);

  const CardComponent =
    density === "compact"
      ? EventCardCompact
      : density === "rich"
        ? EventCardRich
        : EventCardMedium;

  return (
    <div>
      {/* Mobile layout */}
      <div className="md:hidden">
        {/* Tab bar */}
        <div className="flex border-b border-ink">
          <button
            onClick={() => handleTabChange("all")}
            className={`flex-1 py-2.5 font-mono text-[11px] font-bold tracking-wider uppercase cursor-pointer border-none ${
              tab === "all" ? "bg-ink text-bg" : "bg-transparent text-muted"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => isMember ? handleTabChange("for-you") : undefined}
            className={`flex-1 py-2.5 font-mono text-[11px] font-bold tracking-wider uppercase border-none border-l border-ink ${
              tab === "for-you" ? "bg-ink text-bg cursor-pointer" : isMember ? "bg-transparent text-muted cursor-pointer" : "bg-transparent text-muted/40 cursor-default"
            }`}
          >
            For You{!isMember ? " 🔒" : ""}
          </button>
        </div>

        {/* For You feed */}
        {tab === "for-you" && (
          <div className="px-[18px]">
            {forYouLoading ? (
              <div className="py-10 font-mono text-[11px] text-muted tracking-wider uppercase">
                Loading…
              </div>
            ) : forYouEvents && forYouEvents.length > 0 ? (
              forYouEvents.map((e) => <EventCardMedium key={e.id} event={e} />)
            ) : (
              <div className="py-10">
                <div className="font-mono text-[10.5px] text-muted tracking-wider uppercase mb-2">
                  Nothing yet
                </div>
                <p className="text-sm text-ink-soft leading-relaxed">
                  Save some events to help us learn what you like.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filters + Feed */}
        {tab === "all" && (
          <>
            <div className="border-b border-ink">
              <FilterRow label="SOURCE">
                {SOURCES.map((s) => (
                  <Pill
                    key={s.id}
                    active={activeSource === s.id}
                    onClick={() => setActiveSource(s.id)}
                  >
                    {s.label}
                  </Pill>
                ))}
              </FilterRow>
              <FilterRow label="VIBE">
                <Pill
                  active={activeVibe === null}
                  onClick={() => setActiveVibe(null)}
                >
                  All
                </Pill>
                {VIBES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() =>
                      setActiveVibe(activeVibe === v.id ? null : v.id)
                    }
                    className="p-0 bg-transparent border-none cursor-pointer"
                  >
                    <VibeTag vibe={v.id} active={activeVibe === v.id} />
                  </button>
                ))}
              </FilterRow>
              <FilterRow label="SORT">
                {SORT_OPTIONS.map((s) => (
                  <Pill
                    key={s.id}
                    active={sortBy === s.id}
                    onClick={() => setSortBy(s.id)}
                  >
                    {s.label}
                  </Pill>
                ))}
              </FilterRow>
            </div>

            {events.length === 0 ? (
              <div className="px-6 py-10 text-left">
                <div className="font-mono text-[10.5px] text-muted tracking-wider uppercase mb-2.5">
                  0 matches
                </div>
                <h3 className="font-display font-extrabold text-[30px] text-ink tracking-tight leading-none">
                  Nothing in this slice
                  <br />
                  of the feed yet.
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                  Try loosening a filter, or check back later — new events drop most
                  weekday afternoons.
                </p>
                <button
                  onClick={() => {
                    setActiveVibe(null);
                    setActiveSource("all");
                  }}
                  className="mt-4 px-4 py-2.5 border border-ink bg-bg text-ink cursor-pointer font-mono text-[11px] font-bold tracking-wide uppercase"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="px-[18px]">
                {events.map((e) => (
                  <CardComponent key={e.id} event={e} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Desktop layout */}
      <div className="hidden md:block">
        {/* Tab bar — desktop */}
        <div className="flex border-b border-ink">
          <button
            onClick={() => handleTabChange("all")}
            className={`px-6 py-2.5 font-mono text-[11px] font-bold tracking-wider uppercase cursor-pointer border-none border-r border-ink ${
              tab === "all" ? "bg-ink text-bg" : "bg-transparent text-muted"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => isMember ? handleTabChange("for-you") : undefined}
            className={`px-6 py-2.5 font-mono text-[11px] font-bold tracking-wider uppercase border-none border-r border-ink ${
              tab === "for-you" ? "bg-ink text-bg cursor-pointer" : isMember ? "bg-transparent text-muted cursor-pointer" : "bg-transparent text-muted/40 cursor-default"
            }`}
          >
            For You{!isMember ? " (sign in)" : ""}
          </button>
        </div>

        {/* For You — desktop */}
        {tab === "for-you" && (
          <div className="px-8 py-6">
            {forYouLoading ? (
              <div className="font-mono text-[11px] text-muted tracking-wider uppercase">
                Loading…
              </div>
            ) : forYouEvents && forYouEvents.length > 0 ? (
              <div>
                <div className="grid grid-cols-[72px_1fr_84px] gap-4 py-2 border-b border-ink font-mono text-[10px] text-muted tracking-wider uppercase">
                  <div>Date</div>
                  <div>Event</div>
                  <div />
                </div>
                {forYouEvents.map((e) => (
                  <EventCardMedium key={e.id} event={e} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border border-dashed border-ink">
                <h3 className="font-display font-extrabold text-4xl text-ink tracking-tight leading-none">
                  Nothing personalised yet.
                </h3>
                <p className="mt-3 text-[15px] text-muted max-w-md mx-auto">
                  Save some events and we'll learn what you like.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Filter rail + grid */}
        {tab === "all" && <div className="flex border-b border-ink">
          <aside className="w-[260px] shrink-0 p-5 px-6 border-r border-ink">
            <FilterBlock label="Source">
              {SOURCES.map((s) => (
                <RowSelect
                  key={s.id}
                  label={s.label}
                  active={activeSource === s.id}
                  onClick={() => setActiveSource(s.id)}
                />
              ))}
            </FilterBlock>
            <FilterBlock label="Vibe">
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => setActiveVibe(null)}
                  className="p-0 border-none bg-transparent cursor-pointer"
                >
                  <VibeTag vibe="all" active={activeVibe === null} />
                </button>
                {VIBES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() =>
                      setActiveVibe(activeVibe === v.id ? null : v.id)
                    }
                    className="p-0 border-none bg-transparent cursor-pointer"
                  >
                    <VibeTag vibe={v.id} active={activeVibe === v.id} />
                  </button>
                ))}
              </div>
            </FilterBlock>
            <FilterBlock label="Sort">
              {SORT_OPTIONS.map((s) => (
                <RowSelect
                  key={s.id}
                  label={s.label}
                  active={sortBy === s.id}
                  onClick={() => setSortBy(s.id)}
                />
              ))}
            </FilterBlock>
          </aside>

          <main className="flex-1 px-8 py-1.5">
            {events.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-ink">
                <h3 className="font-display font-extrabold text-4xl text-ink tracking-tight leading-none">
                  Nothing in this slice of the feed.
                </h3>
                <p className="mt-3 text-[15px] text-muted max-w-md mx-auto">
                  Loosen a filter or check back tomorrow.
                </p>
              </div>
            ) : density === "rich" ? (
              <div className="grid grid-cols-3 gap-3.5 py-3.5">
                {events.map((e) => (
                  <EventCardRich key={e.id} event={e} />
                ))}
              </div>
            ) : (
              <div>
                <div
                  className={`grid ${
                    density === "compact"
                      ? "grid-cols-[60px_1fr_90px_70px]"
                      : "grid-cols-[72px_1fr_84px]"
                  } gap-${density === "compact" ? 3 : 4} py-2 border-b border-ink font-mono text-[10px] text-muted tracking-wider uppercase`}
                >
                  <div>Date</div>
                  <div>Event</div>
                  {density === "compact" ? (
                    <>
                      <div>Time</div>
                      <div className="text-right">Vibe</div>
                    </>
                  ) : (
                    <div />
                  )}
                </div>
                {events.map((e) => (
                  <CardComponent key={e.id} event={e} />
                ))}
              </div>
            )}
          </main>
        </div>}
      </div>
    </div>
  );
}
