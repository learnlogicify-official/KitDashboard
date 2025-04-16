import React from 'react';
import { DepartmentStats } from '../../types';

interface DashboardHeaderProps {
  selectedDepartment: DepartmentStats | null;
  departments: DepartmentStats[];
  onDepartmentChange: (department: DepartmentStats | null) => void;
}

export default function DashboardHeader({
  selectedDepartment,
  departments,
  onDepartmentChange,
}: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Performance Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Comprehensive analysis of student performance</p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="relative">
          <select
            value={selectedDepartment?.name || ''}
            onChange={(e) => {
              const selected = departments.find(d => d.name === e.target.value) || null;
              onDepartmentChange(selected);
            }}
            className="block w-full rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Overall Report</option>
            {departments.map((dept) => (
              <option key={dept.name} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
} 