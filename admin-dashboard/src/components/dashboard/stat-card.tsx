'use client';

import { 
  CubeIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { formatCurrency, formatNumber } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: 'products' | 'branches' | 'revenue' | 'alerts';
}

const icons = {
  products: CubeIcon,
  branches: BuildingOfficeIcon,
  revenue: CurrencyDollarIcon,
  alerts: ExclamationTriangleIcon,
};

const colors = {
  products: 'bg-primary',
  branches: 'bg-success',
  revenue: 'bg-primary',
  alerts: 'bg-error',
};

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'increase',
  icon 
}: StatCardProps) {
  const Icon = icons[icon];
  const bgColor = colors[icon];

  const displayValue = typeof value === 'number' && icon === 'revenue' 
    ? formatCurrency(value) 
    : formatNumber(Number(value));

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`shrink-0 p-3 rounded-lg ${bgColor}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-text-secondary truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-primary">
                {displayValue}
              </div>
              {change !== undefined && (
                <div
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    changeType === 'increase' ? 'text-success' : 'text-error'
                  }`}
                >
                  {changeType === 'increase' ? (
                    <svg className="self-center shrink-0 h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="self-center shrink-0 h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {Math.abs(change)}%
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
