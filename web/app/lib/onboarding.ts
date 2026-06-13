export function yearLabelToStanding(label?: string) {
  if (!label) return undefined;
  const match = label.match(/^(\d+)/);
  return match ? Number(match[1]) : undefined;
}

export function yearStandingToLabel(year?: number | null) {
  if (!year) return "";
  if (year >= 5) return "5th year+";
  return `${year}${year === 1 ? "st" : year === 2 ? "nd" : year === 3 ? "rd" : "th"} year`;
}
