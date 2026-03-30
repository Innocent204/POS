'use client';

import { formatDateTime } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'sale' | 'transfer' | 'stock_adjustment' | 'new_product';
  description: string;
  user: string;
  timestamp: string;
  branch?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const activityIcons = {
  sale: '💰',
  transfer: '🔄',
  stock_adjustment: '📦',
  new_product: '🆕',
};

const activityColors = {
  sale: 'status-success',
  transfer: 'status-info',
  stock_adjustment: 'status-warning',
  new_product: 'status-info',
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <div className="card">
      <div className="px-6 py-5">
        <h3 className="text-lg font-medium text-primary mb-4">
          Recent Activity
        </h3>
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIdx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {activityIdx !== activities.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-divider"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`
                          h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-card
                          ${activityColors[activity.type]}
                        `}
                      >
                        <span className="text-sm">{activityIcons[activity.type]}</span>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-primary">
                          {activity.description}
                        </p>
                        {activity.branch && (
                          <p className="text-xs text-text-secondary mt-1">
                            {activity.branch}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-text-secondary">
                        <p>{formatDateTime(activity.timestamp)}</p>
                        <p className="text-xs">{activity.user}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
