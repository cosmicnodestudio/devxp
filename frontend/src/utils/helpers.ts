import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format date with time
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-green-600 bg-green-100',
    inactive: 'text-gray-600 bg-gray-100',
    deprecated: 'text-red-600 bg-red-100',
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    degraded: 'text-yellow-600 bg-yellow-100',
    unknown: 'text-gray-600 bg-gray-100',
    healthy: 'text-green-600 bg-green-100',
  };

  return colors[status.toLowerCase()] || 'text-gray-600 bg-gray-100';
}

// Get method color
export function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'text-blue-600 bg-blue-100',
    POST: 'text-green-600 bg-green-100',
    PUT: 'text-yellow-600 bg-yellow-100',
    PATCH: 'text-orange-600 bg-orange-100',
    DELETE: 'text-red-600 bg-red-100',
  };

  return colors[method.toUpperCase()] || 'text-gray-600 bg-gray-100';
}
