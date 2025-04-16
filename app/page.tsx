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
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 lg:p-12">
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
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <Title className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4">
            Assessment Performance Dashboard
          </Title>
          <Text className="text-xl text-indigo-600/80">
            Comprehensive Analysis of Student Performance
          </Text>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 rounded-xl shadow-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 border-none">
                <div className="flex flex-col items-center p-6">
                  <div className="p-3 bg-white/20 rounded-full mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <Text className="text-white/80 mb-2">Total Students</Text>
                  <Metric className="text-4xl font-bold text-white">{stats.totalStudents}</Metric>
                </div>
              </Card>
              <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 border-none">
                <div className="flex flex-col items-center p-6">
                  <div className="p-3 bg-white/20 rounded-full mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <Text className="text-white/80 mb-2">Average Score (Attempt 1)</Text>
                  <Metric className="text-4xl font-bold text-white">
                    {stats.overallAttempt1Average.toFixed(1)}%
                  </Metric>
                </div>
              </Card>
              <Card className="transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br from-pink-500 to-pink-600 border-none">
                <div className="flex flex-col items-center p-6">
                  <div className="p-3 bg-white/20 rounded-full mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <Text className="text-white/80 mb-2">Average Score (Attempt 2)</Text>
                  <Metric className="text-4xl font-bold text-white">
                    {stats.overallAttempt2Average.toFixed(1)}%
                  </Metric>
                </div>
              </Card>
              <Card className={`transform hover:scale-105 transition-all duration-300 shadow-lg bg-gradient-to-br ${stats.overallImprovement >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-red-500 to-red-600'} border-none`}>
                <div className="flex flex-col items-center p-6">
                  <div className="p-3 bg-white/20 rounded-full mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <Text className="text-white/80 mb-2">Overall Improvement</Text>
                  <Metric className="text-4xl font-bold text-white">
                    {stats.overallImprovement >= 0 ? '+' : ''}{stats.overallImprovement.toFixed(1)}%
                  </Metric>
                </div>
              </Card>
            </div>

            <Card className="p-8 shadow-xl rounded-2xl border border-indigo-100/50 bg-white/80 backdrop-blur-sm mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Text className="font-semibold text-2xl text-indigo-700">
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
                  colors={['#3B82F6', '#EC4899']}
                  theme={theme}
                  borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'Score Range',
                    legendPosition: 'middle',
                    legendOffset: 40,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
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
                      symbolSize: 20,
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
                />
              </div>
            </Card>

            {selectedDepartment && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
            )}

            <Card className="p-8 shadow-xl rounded-2xl border border-indigo-100/50 bg-white/80 backdrop-blur-sm mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Text className="font-semibold text-2xl text-indigo-700">
                    Improvement Analysis
                  </Text>
                  <Text className="text-gray-600 mt-1">
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

            <Card className="p-8 shadow-xl rounded-2xl border border-indigo-100/50 bg-white/80 backdrop-blur-sm mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Text className="font-semibold text-2xl text-indigo-700">
                    Students Needing Further Support
                  </Text>
                  <Text className="text-gray-600 mt-1">
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

            <Card className="p-8 shadow-xl rounded-2xl border border-indigo-100/50 bg-white/80 backdrop-blur-sm mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Text className="font-semibold text-2xl text-indigo-700">
                    Students Needing Follow-up
                  </Text>
                  <Text className="text-gray-600 mt-1">
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

            {/* Student Performance Clusters */}
            <Card className="p-8 shadow-xl rounded-2xl border border-indigo-100/50 bg-white/80 backdrop-blur-sm mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <Text className="font-semibold text-2xl text-indigo-700">
                    Student Performance Clusters
                  </Text>
                  <Text className="text-gray-600 mt-1">
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
    </main>
  );
}
