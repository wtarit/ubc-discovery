const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function fmtTime(d: Date): string {
  let h = d.getHours();
  const m = d.getMinutes();
  const ap = h >= 12 ? "pm" : "am";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}${m ? ":" + String(m).padStart(2, "0") : ""}${ap}`;
}

export function fmtRange(a: Date, b: Date): string {
  return `${fmtTime(a)}—${fmtTime(b)}`;
}

export function fmtDay(d: Date, opts?: { short?: boolean }): string {
  return opts?.short
    ? `${WEEKDAY[d.getDay()]} ${MONTH[d.getMonth()]} ${d.getDate()}`
    : `${WEEKDAY[d.getDay()]}, ${MONTH[d.getMonth()]} ${d.getDate()}`;
}

export function fmtMonth(d: Date): string {
  return MONTH[d.getMonth()].toUpperCase();
}

export function fmtDate02(d: Date): string {
  return String(d.getDate()).padStart(2, "0");
}

export function relativeDay(d: Date, now = new Date()): string {
  const days = Math.round(
    (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7 && days > 0) return WEEKDAY[d.getDay()];
  return fmtDay(d, { short: true });
}

export function daysSince(d: Date, now = new Date()): string {
  const days = Math.round(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 wk ago";
  return `${Math.round(days / 7)} wks ago`;
}
