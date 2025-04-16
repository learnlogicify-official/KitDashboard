import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'purple' | 'amber';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  emerald: 'bg-emerald-100 text-emerald-600',
  purple: 'bg-purple-100 text-purple-600',
  amber: 'bg-amber-100 text-amber-600',
};

export default function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <div className="card">
      <div className="card-content">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
              {icon}
            </div>
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-slate-500">{title}</h3>
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 