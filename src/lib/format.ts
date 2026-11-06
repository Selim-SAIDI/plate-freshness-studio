import { format } from "date-fns";

export const fmtDateTime = (iso: string) => format(new Date(iso), "MMM d, yyyy · HH:mm");
export const fmtDate = (iso: string) => format(new Date(iso), "MMM d");

export function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m ? `${m}m ${s.toString().padStart(2, "0")}s` : `${s}s`;
}

export function fmtClock(sec: number) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}

export function fmtTemp(c: number, unit: "C" | "F" = "C") {
  return unit === "F" ? `${(c * 1.8 + 32).toFixed(1)}°F` : `${c.toFixed(1)}°C`;
}
