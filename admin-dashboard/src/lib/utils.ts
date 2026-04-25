import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: any): string {
  const numericAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  
  if (isNaN(numericAmount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericAmount);
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

  const status = err.response?.status;
  const data = err.response?.data;

  // 1. Handle HTML responses (usually from Nginx/proxies)
  const isHtml = typeof data === 'string' && (data.includes('<html>') || data.includes('<!DOCTYPE html>'));

  // 2. Map status codes to user-friendly messages
  const statusMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Your session has expired. Please log in again.',
    403: 'Access denied. You do not have permission for this.',
    404: 'The requested information could not be found.',
    405: 'This action is not supported by the system.',
    409: 'A record with these details already exists (e.g. duplicate SKU or name).',
    500: 'Internal server error. Our team has been notified.',
    502: 'The server is temporarily unavailable.',
    503: 'The service is under maintenance. Please try again later.',
    504: 'The server took too long to respond. Please try again.',
  };

  // 3. If it's NOT HTML and we have structured error data, use it
  if (data && !isHtml) {
    if (data.message) return data.message;
    if (data.error) return data.error;
    if (Array.isArray(data.errors) && data.errors[0]?.message) return data.errors[0].message;
    if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
      const firstError = Object.values(data.errors)[0];
      if (typeof firstError === 'string') return firstError;
    }
    if (typeof data === 'string' && data.length < 200) return data;
  }

  // 4. Use status-based message if available
  if (status && statusMessages[status]) {
    return statusMessages[status];
  }

  // 5. Fallback for generic server errors
  if (status >= 500) {
    return 'The server is currently experiencing issues. Please try again later.';
  }

  // 6. Handle network or other errors
  if (err.message === 'Network Error' || err.code === 'ECONNABORTED') {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  // Final fallback
  return 'An unexpected error occurred. Please try again.';
}
