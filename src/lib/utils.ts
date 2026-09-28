import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function formatScore(score: number): string {
  return (score * 100).toFixed(1) + "%";
}

export function verdictColor(verdict: string): string {
  if (verdict === "BLOCK") return "text-red-400";
  if (verdict === "FLAG") return "text-amber-400";
  return "text-teal-400";
}

export function verdictBg(verdict: string): string {
  if (verdict === "BLOCK") return "bg-red-500/10 text-red-400 border-red-500/30";
  if (verdict === "FLAG") return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  return "bg-teal-500/10 text-teal-400 border-teal-500/30";
}

export function scoreColor(score: number): string {
  if (score >= 0.35) return "text-red-400";
  if (score >= 0.20) return "text-amber-400";
  return "text-teal-400";
}
