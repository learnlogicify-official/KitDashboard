'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  Title,
  Text,
  Grid,
  Metric,
  Badge,
} from '@tremor/react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { readExcelFile, calculateStatistics, StudentData, OverallStats, DepartmentStats } from '../utils/excel';
import { HeatMap } from '@nivo/heatmap';
import StatsCard from './components/StatsCard';
import DashboardHeader from './components/DashboardHeader';

const theme = {
  axis: {
    ticks: {
      text: {
        fill: '#6B7280',
        fontSize: 12,
      },
    },
    legend: {
      text: {
        fill: '#374151',
        fontSize: 14,
      },
    },
  },
  grid: {
    line: {
      stroke: '#E5E7EB',
      strokeWidth: 1,
    },
  },
  legends: {
    text: {
      fill: '#374151',
      fontSize: 12,
    },
  },
};

export default function Home() {
  const [data, setData] = useState<StudentData[]>([]);
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentStats | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [followUpPage, setFollowUpPage] = useState(1);
  const studentsPerPage = 10;
  const [selectedBatch, setSelectedBatch] = useState('A');
  const [batchPage, setBatchPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const excelData = await readExcelFile();
        setData(excelData);
        setStats(calculateStatistics(excelData));
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getBarData = (ranges: any[]) => {
    return ranges.map(range => ({
      range: range.range,
      'Attempt 1': range.attempt1Count,
      'Attempt 2': range.attempt2Count,
    }));
  };

  const getStudentsNeedingSupport = () => {
    return data
      .filter(student => 
        student.attempt2 < 40 && 
        student.attempt2 > student.attempt1
      )
      .sort((a, b) => b.attempt2 - a.attempt2);
  };

  const getStudentsNeedingFollowUp = () => {
    return data
      .filter(student => 
        (student.attempt2 - student.attempt1) <= -15
      )
      .sort((a, b) => (a.attempt2 - a.attempt1) - (b.attempt2 - b.attempt1));
  };

  const paginatedStudents = () => {
    const allStudents = getStudentsNeedingSupport();
    const startIndex = (currentPage - 1) * studentsPerPage;
    return allStudents.slice(startIndex, startIndex + studentsPerPage);
  };

  const paginatedFollowUpStudents = () => {
    const allStudents = getStudentsNeedingFollowUp();
    const startIndex = (followUpPage - 1) * studentsPerPage;
    return allStudents.slice(startIndex, startIndex + studentsPerPage);
  };

  const totalPages = Math.ceil(getStudentsNeedingSupport().length / studentsPerPage);
  const totalFollowUpPages = Math.ceil(getStudentsNeedingFollowUp().length / studentsPerPage);

  const getBatchStudents = () => {
    // Sort students by their average score across both attempts
    const sortedStudents = [...data].sort((a, b) => {
      const avgA = (a.attempt1 + a.attempt2) / 2;
      const avgB = (b.attempt1 + b.attempt2) / 2;
      return avgB - avgA;
    });

    const batchSize = Math.ceil(data.length / 4);
    switch (selectedBatch) {
      case 'A':
        return sortedStudents.slice(0, batchSize);
      case 'B':
        return sortedStudents.slice(batchSize, batchSize * 2);
      case 'C':
        return sortedStudents.slice(batchSize * 2, batchSize * 3);
      case 'D':
        return sortedStudents.slice(batchSize * 3);
      default:
        return sortedStudents.slice(0, batchSize);
    }
  };

  const paginatedBatchStudents = () => {
    const allStudents = getBatchStudents();
    const startIndex = (batchPage - 1) * studentsPerPage;
    return allStudents.slice(startIndex, startIndex + studentsPerPage);
  };

  const totalBatchPages = Math.ceil(getBatchStudents().length / studentsPerPage);

  if (isLoading) {
  return (
      <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-cyan-50 p-2 md:p-4 lg:p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <Text className="text-lg text-indigo-600">Loading dashboard data...</Text>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-indigo-50 via-fuchsia-50 to-cyan-50 p-2 md:p-4 lg:p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))]">
      <div className="max-w-[100rem] mx-auto">
        <div className="space-y-8">
          <div className="flex justify-between items-center bg-white/40 backdrop-blur-lg rounded-2xl p-6 border border-white/50 shadow-xl">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">NexAcademy Performance Dashboard</h1>
              <p className="mt-2 text-base text-gray-600">Comprehensive analysis of student performance at NexAcademy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Students"
              value={stats?.totalStudents || 0}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              color="blue"
            />

            <StatsCard
              title="Average Score (Attempt 1)"
              value={`${stats?.overallAttempt1Average.toFixed(2) || '0.00'}%`}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              color="emerald"
            />

            <StatsCard
              title="Average Score (Attempt 2)"
              value={`${stats?.overallAttempt2Average.toFixed(2) || '0.00'}%`}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              color="purple"
            />

            <StatsCard
              title="Improvement"
              value={`${(stats?.overallImprovement || 0) >= 0 ? '+' : ''}${(stats?.overallImprovement || 0).toFixed(2)}%`}
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="amber"
            />
          </div>

          {error && (
            <div className="mb-8 p-6 bg-red-50/90 backdrop-blur-sm border border-red-200 text-red-700 rounded-2xl shadow-lg">
              <div className="flex items-center">
                <svg className="h-6 w-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {stats && (
            <>
              <Card className="p-8 shadow-2xl rounded-2xl border border-white/50 bg-white/40 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Text className="font-semibold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {selectedDepartment ? `${selectedDepartment.name} Score Distribution` : 'Score Distribution'}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      {selectedDepartment 
                        ? `View score distribution for ${selectedDepartment.name}`
                        : 'View overall or department-wise score distribution'}
                    </Text>
                  </div>
                  <select 
                    className="p-3 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 shadow-sm text-indigo-700 font-medium"
                    onChange={(e) => {
                      if (e.target.value === "overall") {
                        setSelectedDepartment(null);
                      } else {
                        const selectedDept = stats.departments.find(d => d.name === e.target.value);
                        if (selectedDept) {
                          setSelectedDepartment(selectedDept);
                        }
                      }
                    }}
                    defaultValue="overall"
                  >
                    <option value="overall">Overall Report</option>
                    {stats.departments.map((dept) => (
                      <option key={dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="h-[400px] w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
                  <ResponsiveBar
                    data={selectedDepartment ? getBarData(selectedDepartment.scoreRanges) : getBarData(stats.scoreRanges)}
                    keys={['Attempt 1', 'Attempt 2']}
                    indexBy="range"
                    margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={['#6366f1', '#ec4899']}
                    theme={{
                      ...theme,
                      axis: {
                        ...theme.axis,
                        ticks: {
                          ...theme.axis.ticks,
                          text: {
                            ...theme.axis.ticks.text,
                            fontSize: 11,
                            fontWeight: 500,
                            fill: '#4B5563',
                          },
                        },
                        legend: {
                          text: {
                            fill: '#1F2937',
                            fontSize: 12,
                            fontWeight: 600,
                          },
                        },
                      },
                      grid: {
                        line: {
                          stroke: '#E5E7EB',
                          strokeWidth: 1,
                          strokeDasharray: '4 4',
                        },
                      },
                      tooltip: {
                        container: {
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          padding: '12px',
                        },
                      },
                    }}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 0,
                      tickPadding: 10,
                      tickRotation: 0,
                      legend: 'Score Range',
                      legendPosition: 'middle',
                      legendOffset: 40,
                    }}
                    axisLeft={{
                      tickSize: 0,
                      tickPadding: 10,
                      tickRotation: 0,
                      legend: 'Number of Students',
                      legendPosition: 'middle',
                      legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    legends={[
                      {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 12,
                        symbolShape: 'circle',
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemOpacity: 1,
                            },
                          },
                        ],
                      },
                    ]}
                    animate={true}
                    motionConfig={{
                      mass: 1,
                      tension: 170,
                      friction: 26,
                      clamp: false,
                      precision: 0.01,
                      velocity: 0,
                    }}
                    enableGridY={true}
                    enableGridX={false}
                    barAriaLabel={e => `${e.id}: ${e.value} in ${e.indexValue}`}
                    tooltip={({ id, value, color }) => (
                      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                          <span className="font-medium text-gray-700">{id}:</span>
                          <span className="font-semibold text-gray-900">{value} students</span>
                        </div>
                      </div>
                    )}
                    enableLabel={true}
                    label={d => `${d.value}`}
                    borderRadius={4}
                    innerPadding={2}
                  />
                </div>
                {selectedDepartment && (
                  <div className="mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 border-none">
                        <div className="flex flex-col items-center p-6">
                          <div className="p-3 bg-white/20 rounded-full mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <Text className="text-white/80 mb-2">Average Score (Attempt 1)</Text>
                          <Metric className="text-4xl font-bold text-white">
                            {selectedDepartment.attempt1Average.toFixed(1)}%
                          </Metric>
                        </div>
                      </Card>
                      <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 border-none">
                        <div className="flex flex-col items-center p-6">
                          <div className="p-3 bg-white/20 rounded-full mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <Text className="text-white/80 mb-2">Average Score (Attempt 2)</Text>
                          <Metric className="text-4xl font-bold text-white">
                            {selectedDepartment.attempt2Average.toFixed(1)}%
                          </Metric>
                        </div>
                      </Card>
                      <Card className={`transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br ${selectedDepartment.improvement >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} border-none`}>
                        <div className="flex flex-col items-center p-6">
                          <div className="p-3 bg-white/20 rounded-full mb-4">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <Text className="text-white/80 mb-2">Improvement</Text>
                          <Metric className="text-4xl font-bold text-white">
                            {selectedDepartment.improvement >= 0 ? '+' : ''}{selectedDepartment.improvement.toFixed(1)}%
                          </Metric>
                        </div>
                      </Card>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-8 shadow-2xl rounded-2xl border border-white/50 bg-white/40 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <Text className="font-semibold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Score Distribution by Department
                    </Text>
                    <Text className="text-gray-600 mt-2">
                      Distribution of scores across departments for both attempts
                    </Text>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attempt 1 Heat Map */}
                  <div>
                    <Text className="font-semibold text-lg text-indigo-700 mb-4">
                      Attempt 1 Score Distribution by Department
                    </Text>
                    <div className="h-[400px] w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
                      <ResponsiveHeatMap
                        data={stats.departments.map(dept => ({
                          id: dept.name,
                          data: dept.scoreRanges.map(range => ({
                            x: range.range,
                            y: range.attempt1Count
                          }))
                        }))}
                        margin={{ top: 20, right: 20, bottom: 60, left: 100 }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'Attempt1_Range',
                          legendPosition: 'middle',
                          legendOffset: 45
                        }}
                        axisLeft={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'DEPARTMENT',
                          legendPosition: 'middle',
                          legendOffset: -70
                        }}
                        colors={{
                          type: 'sequential',
                          scheme: 'reds',
                          minValue: 0,
                          maxValue: 50
                        }}
                        emptyColor="#ffffff"
                        enableLabels={true}
                        labelTextColor="#000000"
                        animate={false}
                      />
                    </div>
                  </div>
                  
                  {/* Attempt 2 Heat Map */}
                  <div>
                    <Text className="font-semibold text-lg text-indigo-700 mb-4">
                      Attempt 2 Score Distribution by Department
                    </Text>
                    <div className="h-[400px] w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
                      <ResponsiveHeatMap
                        data={stats.departments.map(dept => ({
                          id: dept.name,
                          data: dept.scoreRanges.map(range => ({
                            x: range.range,
                            y: range.attempt2Count
                          }))
                        }))}
                        margin={{ top: 20, right: 20, bottom: 60, left: 100 }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'Attempt2_Range',
                          legendPosition: 'middle',
                          legendOffset: 45
                        }}
                        axisLeft={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'DEPARTMENT',
                          legendPosition: 'middle',
                          legendOffset: -70
                        }}
                        colors={{
                          type: 'sequential',
                          scheme: 'reds',
                          minValue: 0,
                          maxValue: 30
                        }}
                        emptyColor="#ffffff"
                        enableLabels={true}
                        labelTextColor="#000000"
                        animate={false}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 shadow-2xl rounded-2xl border border-white/50 bg-white/40 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <Text className="font-semibold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Improvement Analysis
                    </Text>
                    <Text className="text-gray-600 mt-2">
                      Track student performance trends and identify areas for improvement
                    </Text>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Text className="font-semibold text-lg text-indigo-700">Top 10 Most Improved Students</Text>
                      <Badge color="emerald" size="sm">Highest Growth</Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Department</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attempt 1</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attempt 2</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Improvement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data
                            .filter(student => student.attempt2 > student.attempt1)
                            .sort((a, b) => (b.attempt2 - b.attempt1) - (a.attempt2 - a.attempt1))
                            .slice(0, 10)
                            .map((student, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-700">{student.name}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{student.department}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{student.attempt1.toFixed(1)}%</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{student.attempt2.toFixed(1)}%</td>
                                <td className="py-3 px-4 text-sm">
                                  <Badge color="emerald" size="sm">
                                    +{((student.attempt2 - student.attempt1) / student.attempt1 * 100).toFixed(1)}%
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Text className="font-semibold text-lg text-indigo-700">Top 10 Most Declined Students</Text>
                      <Badge color="red" size="sm">Needs Attention</Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Department</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attempt 1</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attempt 2</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Decline</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data
                            .filter(student => student.attempt2 < student.attempt1)
                            .sort((a, b) => (a.attempt2 - a.attempt1) - (b.attempt2 - b.attempt1))
                            .slice(0, 10)
                            .map((student, index) => (
                              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4 text-sm text-gray-700">{student.name}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{student.department}</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{student.attempt1.toFixed(1)}%</td>
                                <td className="py-3 px-4 text-sm text-gray-700">{student.attempt2.toFixed(1)}%</td>
                                <td className="py-3 px-4 text-sm">
                                  <Badge color="red" size="sm">
                                    {((student.attempt2 - student.attempt1) / student.attempt1 * 100).toFixed(1)}%
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 shadow-2xl rounded-2xl border border-white/50 bg-white/40 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <Text className="font-semibold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Students Needing Further Support
                    </Text>
                    <Text className="text-gray-600 mt-2">
                      Students who are improving but still scoring below 40%
                    </Text>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Department</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attempt 1</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attempt 2</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Improvement</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudents().map((student, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-700">{student.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{student.department}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{student.attempt1.toFixed(1)}%</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{student.attempt2.toFixed(1)}%</td>
                            <td className="py-3 px-4 text-sm">
                              <Badge color="emerald" size="sm">
                                +{((student.attempt2 - student.attempt1) / student.attempt1 * 100).toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Text className="text-sm text-gray-600">
                      Showing {Math.min((currentPage - 1) * studentsPerPage + 1, getStudentsNeedingSupport().length)} to {Math.min(currentPage * studentsPerPage, getStudentsNeedingSupport().length)} of {getStudentsNeedingSupport().length} students
                    </Text>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 shadow-2xl rounded-2xl border border-white/50 bg-white/40 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <Text className="font-semibold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Students Needing Follow-up
                    </Text>
                    <Text className="text-gray-600 mt-2">
                      Students who dropped drastically (15% or more)
                    </Text>
                  </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Department</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attempt 1</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attempt 2</th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Decline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedFollowUpStudents().map((student, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-700">{student.name}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{student.department}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{student.attempt1.toFixed(1)}%</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{student.attempt2.toFixed(1)}%</td>
                            <td className="py-3 px-4 text-sm">
                              <Badge color="red" size="sm">
                                {((student.attempt2 - student.attempt1) / student.attempt1 * 100).toFixed(1)}%
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <Text className="text-sm text-gray-600">
                      Showing {Math.min((followUpPage - 1) * studentsPerPage + 1, getStudentsNeedingFollowUp().length)} to {Math.min(followUpPage * studentsPerPage, getStudentsNeedingFollowUp().length)} of {getStudentsNeedingFollowUp().length} students
                    </Text>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setFollowUpPage(prev => Math.max(prev - 1, 1))}
                        disabled={followUpPage === 1}
                        className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setFollowUpPage(prev => Math.min(prev + 1, totalFollowUpPages))}
                        disabled={followUpPage === totalFollowUpPages}
                        className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 shadow-2xl rounded-2xl border border-white/50 bg-white/40 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <Text className="font-semibold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Student Performance Clusters
                    </Text>
                    <Text className="text-gray-600 mt-2">
                      Students grouped into 4 equal-sized batches based on performance
                    </Text>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Batch A */}
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Text className="font-semibold text-lg text-emerald-700">Batch A</Text>
                      <Badge color="emerald" size="sm">Top 25%</Badge>
                    </div>
                    <div className="space-y-2">
                      <Text className="text-emerald-600">Highest performing students</Text>
                      <div className="mt-4">
                        <Text className="text-sm text-emerald-600 font-medium">Total Students: {
                          Math.ceil(data.length / 4)
                        }</Text>
                      </div>
                    </div>
                  </div>

                  {/* Batch B */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Text className="font-semibold text-lg text-blue-700">Batch B</Text>
                      <Badge color="blue" size="sm">25-50%</Badge>
                    </div>
                    <div className="space-y-2">
                      <Text className="text-blue-600">Above average performers</Text>
                      <div className="mt-4">
                        <Text className="text-sm text-blue-600 font-medium">Total Students: {
                          Math.ceil(data.length / 4)
                        }</Text>
                      </div>
                    </div>
                  </div>

                  {/* Batch C */}
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Text className="font-semibold text-lg text-amber-700">Batch C</Text>
                      <Badge color="amber" size="sm">50-75%</Badge>
                    </div>
                    <div className="space-y-2">
                      <Text className="text-amber-600">Below average performers</Text>
                      <div className="mt-4">
                        <Text className="text-sm text-amber-600 font-medium">Total Students: {
                          Math.ceil(data.length / 4)
                        }</Text>
                      </div>
                    </div>
                  </div>

                  {/* Batch D */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Text className="font-semibold text-lg text-red-700">Batch D</Text>
                      <Badge color="red" size="sm">75-100%</Badge>
                    </div>
                    <div className="space-y-2">
                      <Text className="text-red-600">Lowest performing students</Text>
                      <div className="mt-4">
                        <Text className="text-sm text-red-600 font-medium">Total Students: {
                          Math.floor(data.length / 4)
                        }</Text>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Student Table */}
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <Text className="font-semibold text-lg text-indigo-700">Student Batch Details</Text>
                    <select 
                      className="p-2 border border-indigo-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/90 shadow-sm text-indigo-700 font-medium"
                      onChange={(e) => {
                        setSelectedBatch(e.target.value);
                        setBatchPage(1);
                      }}
                      defaultValue="A"
                    >
                      <option value="A">Batch A</option>
                      <option value="B">Batch B</option>
                      <option value="C">Batch C</option>
                      <option value="D">Batch D</option>
                    </select>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Student Name</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Department</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attempt 1</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Attempt 2</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600">Improvement</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedBatchStudents().map((student, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-700">{student.name}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{student.department}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{student.attempt1.toFixed(1)}%</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{student.attempt2.toFixed(1)}%</td>
                              <td className="py-3 px-4 text-sm">
                                <Badge color={student.attempt2 > student.attempt1 ? "emerald" : "red"} size="sm">
                                  {student.attempt2 > student.attempt1 ? '+' : ''}
                                  {((student.attempt2 - student.attempt1) / student.attempt1 * 100).toFixed(1)}%
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Text className="text-sm text-gray-600">
                        Showing {Math.min((batchPage - 1) * studentsPerPage + 1, getBatchStudents().length)} to {Math.min(batchPage * studentsPerPage, getBatchStudents().length)} of {getBatchStudents().length} students
                      </Text>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setBatchPage(prev => Math.max(prev - 1, 1))}
                          disabled={batchPage === 1}
                          className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setBatchPage(prev => Math.min(prev + 1, totalBatchPages))}
                          disabled={batchPage === totalBatchPages}
                          className="px-3 py-1 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
