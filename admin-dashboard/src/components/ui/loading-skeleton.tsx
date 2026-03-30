'use client';

interface LoadingSkeletonProps {
  className?: string;
}

export default function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-surface rounded-lg"></div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <div className="h-10 w-10 bg-surface rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface rounded w-3/4"></div>
          <div className="h-4 bg-surface rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-surface rounded"></div>
        <div className="h-3 bg-surface rounded w-5/6"></div>
      </div>
    </div>
  );
}
