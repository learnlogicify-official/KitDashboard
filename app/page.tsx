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
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-4xl font-bold text-white mb-2">NexAcademy Performance Dashboard</h1>
            <p className="text-indigo-100 text-lg">Comprehensive analysis of student performance metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 border-none rounded-2xl p-4">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-white/20 rounded-full mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <Text className="text-white/80 text-sm mb-1">Average Score (Attempt 1)</Text>
                <Metric className="text-2xl font-bold text-white">
                  {stats?.overallAttempt1Average.toFixed(1)}%
                </Metric>
              </div>
            </Card>
            <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 border-none rounded-2xl p-4">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-white/20 rounded-full mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <Text className="text-white/80 text-sm mb-1">Average Score (Attempt 2)</Text>
                <Metric className="text-2xl font-bold text-white">
                  {stats?.overallAttempt2Average.toFixed(1)}%
                </Metric>
              </div>
            </Card>
            <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 border-none rounded-2xl p-4">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-white/20 rounded-full mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <Text className="text-white/80 text-sm mb-1">Overall Improvement</Text>
                <Metric className="text-2xl font-bold text-white">
                  {stats?.overallImprovement >= 0 ? '+' : ''}{stats?.overallImprovement.toFixed(1)}%
                </Metric>
              </div>
            </Card>
            <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br from-pink-500 to-pink-600 border-none rounded-2xl p-4">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-white/20 rounded-full mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <Text className="text-white/80 text-sm mb-1">Total Students</Text>
                <Metric className="text-2xl font-bold text-white">
                  {stats?.totalStudents}
                </Metric>
              </div>
            </Card>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
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

              <Card className="p-6 shadow-2xl rounded-2xl border border-white/50 bg-white/40 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <Text className="font-semibold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Score Distribution by Department
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      Distribution of scores across departments for both attempts
                    </Text>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attempt 1 Heat Map */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <Text className="font-semibold text-lg text-indigo-700">Attempt 1</Text>
                      <Badge color="blue" size="sm">First Assessment</Badge>
                    </div>
                    <div className="h-[400px] w-full">
                      <ResponsiveHeatMap
                        data={stats.departments.map(dept => ({
                          id: dept.name,
                          data: dept.scoreRanges.map(range => ({
                            x: range.range,
                            y: Math.round(range.attempt1Count)
                          }))
                        }))}
                        margin={{ top: 20, right: 20, bottom: 60, left: 100 }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 0,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'Score Range',
                          legendPosition: 'middle',
                          legendOffset: 45
                        }}
                        axisLeft={{
                          tickSize: 0,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'Department',
                          legendPosition: 'middle',
                          legendOffset: -70
                        }}
                        colors={{
                          type: 'sequential',
                          scheme: 'blues',
                          minValue: 0,
                          maxValue: Math.max(...stats.departments.flatMap(dept => 
                            dept.scoreRanges.map(range => Math.round(range.attempt1Count))
                          ))
                        }}
                        emptyColor="#f3f4f6"
                        enableLabels={true}
                        labelTextColor="#1F2937"
                        animate={true}
                        motionConfig={{
                          mass: 1,
                          tension: 170,
                          friction: 26,
                          clamp: false,
                          precision: 0.01,
                          velocity: 0
                        }}
                        cellOpacity={0.8}
                        cellHoverOpacity={1}
                        cellHoverOthersOpacity={0.5}
                        cellBorderWidth={0}
                        cellBorderColor="#ffffff"
                        enableGridX={false}
                        enableGridY={false}
                        tooltip={({ cell }) => (
                          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-gray-600">{cell.serieId}</span>
                              <span className="text-sm font-medium text-gray-600">Score Range: {cell.x}</span>
                              <span className="text-sm font-semibold text-gray-900">{Math.round(cell.value || 0)} students</span>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                  
                  {/* Attempt 2 Heat Map */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <Text className="font-semibold text-lg text-indigo-700">Attempt 2</Text>
                      <Badge color="purple" size="sm">Second Assessment</Badge>
                    </div>
                    <div className="h-[400px] w-full">
                      <ResponsiveHeatMap
                        data={stats.departments.map(dept => ({
                          id: dept.name,
                          data: dept.scoreRanges.map(range => ({
                            x: range.range,
                            y: Math.round(range.attempt2Count)
                          }))
                        }))}
                        margin={{ top: 20, right: 20, bottom: 60, left: 100 }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 0,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'Score Range',
                          legendPosition: 'middle',
                          legendOffset: 45
                        }}
                        axisLeft={{
                          tickSize: 0,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: 'Department',
                          legendPosition: 'middle',
                          legendOffset: -70
                        }}
                        colors={{
                          type: 'sequential',
                          scheme: 'purples',
                          minValue: 0,
                          maxValue: Math.max(...stats.departments.flatMap(dept => 
                            dept.scoreRanges.map(range => Math.round(range.attempt2Count))
                          ))
                        }}
                        emptyColor="#f3f4f6"
                        enableLabels={true}
                        labelTextColor="#1F2937"
                        animate={true}
                        motionConfig={{
                          mass: 1,
                          tension: 170,
                          friction: 26,
                          clamp: false,
                          precision: 0.01,
                          velocity: 0
                        }}
                        cellOpacity={0.8}
                        cellHoverOpacity={1}
                        cellHoverOthersOpacity={0.5}
                        cellBorderWidth={0}
                        cellBorderColor="#ffffff"
                        enableGridX={false}
                        enableGridY={false}
                        tooltip={({ cell }) => (
                          <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium text-gray-600">{cell.serieId}</span>
                              <span className="text-sm font-medium text-gray-600">Score Range: {cell.x}</span>
                              <span className="text-sm font-semibold text-gray-900">{Math.round(cell.value || 0)} students</span>
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8 shadow-2xl rounded-2xl border border-white/50 bg-white/40 backdrop-blur-lg">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <Text className="font-semibold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Department Performance Trends
                    </Text>
                    <Text className="text-gray-600 mt-2">
                      Average scores across departments for both attempts
                    </Text>
                  </div>
                </div>
                <div className="h-[400px] w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
                  <ResponsiveLine
                    data={[
                      {
                        id: 'Attempt 1',
                        data: stats.departments.map(dept => ({
                          x: dept.name,
                          y: dept.attempt1Average
                        })),
                        color: '#6366f1'
                      },
                      {
                        id: 'Attempt 2',
                        data: stats.departments.map(dept => ({
                          x: dept.name,
                          y: dept.attempt2Average
                        })),
                        color: '#ec4899'
                      }
                    ]}
                    margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 0, max: 100 }}
                    curve="monotoneX"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 0,
                      tickPadding: 10,
                      tickRotation: -45,
                      legend: 'Department',
                      legendPosition: 'middle',
                      legendOffset: 40
                    }}
                    axisLeft={{
                      tickSize: 0,
                      tickPadding: 10,
                      tickRotation: 0,
                      legend: 'Average Score (%)',
                      legendPosition: 'middle',
                      legendOffset: -50
                    }}
                    enableGridX={false}
                    enableGridY={true}
                    enablePoints={true}
                    pointSize={8}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                    theme={{
                      axis: {
                        ticks: {
                          text: {
                            fill: '#6B7280',
                            fontSize: 12,
                            fontWeight: 500
                          }
                        },
                        legend: {
                          text: {
                            fill: '#374151',
                            fontSize: 14,
                            fontWeight: 600
                          }
                        }
                      },
                      grid: {
                        line: {
                          stroke: '#E5E7EB',
                          strokeWidth: 1,
                          strokeDasharray: '4 4'
                        }
                      },
                      tooltip: {
                        container: {
                          background: 'rgba(255, 255, 255, 0.9)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          padding: '12px'
                        }
                      }
                    }}
                    tooltip={({ point }) => (
                      <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-600">{point.serieId}</span>
                          <span className="text-sm font-medium text-gray-600">{point.data.xFormatted}</span>
                          <span className="text-sm font-semibold text-gray-900">{point.data.yFormatted}%</span>
                        </div>
                      </div>
                    )}
                    legends={[
                      {
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 100,
                        translateY: 0,
                        itemsSpacing: 0,
                        itemDirection: 'left-to-right',
                        itemWidth: 80,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: 'circle',
                        symbolBorderColor: 'rgba(0, 0, 0, .5)',
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemBackground: 'rgba(0, 0, 0, .03)',
                              itemOpacity: 1
                            }
                          }
                        ]
                      }
                    ]}
                  />
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Highest Growth
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full rounded-xl overflow-hidden">
                        <thead>
                          <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Student</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Department</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Attempt 1</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Attempt 2</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Improvement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data
                            .filter(student => student.attempt2 > student.attempt1)
                            .sort((a, b) => (b.attempt2 - b.attempt1) - (a.attempt2 - a.attempt1))
                            .slice(0, 10)
                            .map((student, index) => (
                              <tr key={index} className="hover:bg-indigo-50/50 transition-all duration-200">
                                <td className="py-4 px-6 text-sm text-gray-700 font-medium">{student.name}</td>
                                <td className="py-4 px-6 text-sm text-gray-700">{student.department}</td>
                                <td className="py-4 px-6 text-sm text-gray-700">{student.attempt1.toFixed(1)}%</td>
                                <td className="py-4 px-6 text-sm text-gray-700">{student.attempt2.toFixed(1)}%</td>
                                <td className="py-4 px-6 text-sm">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                    {student.attempt2 > student.attempt1 ? '+' : ''}
                                    {((student.attempt2 - student.attempt1) / student.attempt1 * 100).toFixed(1)}%
                                  </span>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Needs Attention
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full rounded-xl overflow-hidden">
                        <thead>
                          <tr className="bg-gradient-to-r from-rose-600 to-pink-600">
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Student</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Department</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Attempt 1</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Attempt 2</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Decline</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {data
                            .filter(student => student.attempt2 < student.attempt1)
                            .sort((a, b) => (a.attempt2 - a.attempt1) - (b.attempt2 - b.attempt1))
                            .slice(0, 10)
                            .map((student, index) => (
                              <tr key={index} className="hover:bg-rose-50/50 transition-all duration-200">
                                <td className="py-4 px-6 text-sm text-gray-700 font-medium">{student.name}</td>
                                <td className="py-4 px-6 text-sm text-gray-700">{student.department}</td>
                                <td className="py-4 px-6 text-sm text-gray-700">{student.attempt1.toFixed(1)}%</td>
                                <td className="py-4 px-6 text-sm text-gray-700">{student.attempt2.toFixed(1)}%</td>
                                <td className="py-4 px-6 text-sm">
                                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200">
                                    {student.attempt2 > student.attempt1 ? '+' : ''}
                                    {((student.attempt2 - student.attempt1) / student.attempt1 * 100).toFixed(1)}%
                                  </span>
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
                    <table className="w-full rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                          <th className="py-4 px-6 text-left text-sm font-semibold text-white">Student</th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-white">Department</th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-white">Attempt 1</th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-white">Attempt 2</th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-white">Improvement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedStudents().map((student, index) => (
                          <tr key={index} className="hover:bg-indigo-50/50 transition-all duration-200">
                            <td className="py-4 px-6 text-sm text-gray-700 font-medium">{student.name}</td>
                            <td className="py-4 px-6 text-sm text-gray-700">{student.department}</td>
                            <td className="py-4 px-6 text-sm text-gray-700">{student.attempt1.toFixed(1)}%</td>
                            <td className="py-4 px-6 text-sm text-gray-700">{student.attempt2.toFixed(1)}%</td>
                            <td className="py-4 px-6 text-sm">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                {student.attempt2 > student.attempt1 ? '+' : ''}
                                {((student.attempt2 - student.attempt1) / student.attempt1 * 100).toFixed(1)}%
                              </span>
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
                    <table className="w-full rounded-xl overflow-hidden">
                      <thead>
                        <tr className="bg-gradient-to-r from-rose-600 to-pink-600">
                          <th className="py-4 px-6 text-left text-sm font-semibold text-white">Student</th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-white">Department</th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-white">Attempt 1</th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-white">Attempt 2</th>
                          <th className="py-4 px-6 text-left text-sm font-semibold text-white">Decline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedFollowUpStudents().map((student, index) => (
                          <tr key={index} className="hover:bg-rose-50/50 transition-all duration-200">
                            <td className="py-4 px-6 text-sm text-gray-700 font-medium">{student.name}</td>
                            <td className="py-4 px-6 text-sm text-gray-700">{student.department}</td>
                            <td className="py-4 px-6 text-sm text-gray-700">{student.attempt1.toFixed(1)}%</td>
                            <td className="py-4 px-6 text-sm text-gray-700">{student.attempt2.toFixed(1)}%</td>
                            <td className="py-4 px-6 text-sm">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200">
                                {student.attempt2 > student.attempt1 ? '+' : ''}
                                {((student.attempt2 - student.attempt1) / student.attempt1 * 100).toFixed(1)}%
                              </span>
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
                      <table className="w-full rounded-xl overflow-hidden">
                        <thead>
                          <tr className="bg-gradient-to-r from-blue-600 to-cyan-600">
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Student Name</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Department</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Attempt 1</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Attempt 2</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-white">Improvement</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {paginatedBatchStudents().map((student, index) => (
                            <tr key={index} className="hover:bg-blue-50/50 transition-all duration-200">
                              <td className="py-4 px-6 text-sm text-gray-700 font-medium">{student.name}</td>
                              <td className="py-4 px-6 text-sm text-gray-700">{student.department}</td>
                              <td className="py-4 px-6 text-sm text-gray-700">{student.attempt1.toFixed(1)}%</td>
                              <td className="py-4 px-6 text-sm text-gray-700">{student.attempt2.toFixed(1)}%</td>
                              <td className="py-4 px-6 text-sm">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                                  {student.attempt2 > student.attempt1 ? '+' : ''}
                                  {((student.attempt2 - student.attempt1) / student.attempt1 * 100).toFixed(1)}%
                                </span>
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
