import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// --- Plain-English score labels ---

export type FitLevel = 'strong' | 'good' | 'moderate' | 'exploring';

export function getFitLevel(score: number): FitLevel {
  // score is 0-1 (e.g. 0.92) or 0-100
  const normalized = score > 1 ? score : score * 100;
  if (normalized >= 80) return 'strong';
  if (normalized >= 65) return 'good';
  if (normalized >= 50) return 'moderate';
  return 'exploring';
}

export function getFitLabel(score: number): string {
  const level = getFitLevel(score);
  switch (level) {
    case 'strong': return 'Strong Match';
    case 'good': return 'Good Match';
    case 'moderate': return 'Solid Prospect';
    case 'exploring': return 'Worth Exploring';
  }
}

export function getFitBadgeColors(score: number): {
  bg: string;
  text: string;
  border: string;
  ring: string;
} {
  const level = getFitLevel(score);
  switch (level) {
    case 'strong':
      return { bg: 'bg-va-green/10', text: 'text-va-green', border: 'border-va-green/25', ring: 'text-va-green' };
    case 'good':
      return { bg: 'bg-va-blue/10', text: 'text-va-blue', border: 'border-va-blue/25', ring: 'text-va-blue' };
    case 'moderate':
      return { bg: 'bg-va-amber/10', text: 'text-va-amber', border: 'border-va-amber/25', ring: 'text-va-amber' };
    case 'exploring':
      return { bg: 'bg-va-surface-2', text: 'text-va-text-muted', border: 'border-va-border', ring: 'text-va-text-muted' };
  }
}

export function getScoreBarColor(percentage: number): string {
  if (percentage >= 80) return 'bg-va-green';
  if (percentage >= 50) return 'bg-va-amber';
  return 'bg-va-red';
}

export function getScoreBarLabel(percentage: number): string {
  if (percentage >= 80) return 'Strong';
  if (percentage >= 50) return 'Moderate';
  return 'Low';
}

export function normalizeScore(score: number): number {
  // Normalize 0-1 scores to 0-100
  return score > 1 ? score : Math.round(score * 100);
}

export function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}
