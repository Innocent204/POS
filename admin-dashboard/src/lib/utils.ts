import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Transfer statuses
    pending: 'badge badge-warning',
    dispatched: 'badge badge-info',
    received: 'badge badge-success',
    cancelled: 'badge badge-error',

    // Sale statuses
    completed: 'badge badge-success',
    returned: 'badge badge-warning',

    // Alert severities
    low: 'badge badge-info',
    medium: 'badge badge-warning',
    high: 'badge badge-warning',
    critical: 'badge badge-error',

    // General
    active: 'badge badge-success',
    inactive: 'badge badge-default',
  };

  return colors[status] ?? 'badge badge-default';
}

export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred.';

  // If backend provided a direct message, use it
  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  // Handle common HTTP status codes with friendly messages
  if (err.response?.status) {
    const status = err.response.status;
    if (status === 401) return 'Invalid email or password.';
    if (status === 403) return 'You do not have permission to perform this action.';
    if (status === 404) return 'The requested resource was not found.';
    if (status >= 500) return 'The server is currently unavailable. Please try again later.';
  }

  // Handle network or other errors
  if (err.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  // Fallback to a generic message instead of "Request failed with status code XXX"
  return 'An error occurred. Please try again.';
}
