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
      return { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', ring: 'text-green-500' };
    case 'good':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', ring: 'text-blue-500' };
    case 'moderate':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', ring: 'text-amber-500' };
    case 'exploring':
      return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', ring: 'text-gray-400' };
  }
}

export function getScoreBarColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 50) return 'bg-amber-500';
  return 'bg-red-400';
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
