import * as XLSX from 'xlsx';

export interface StudentData {
  name: string;
  rollNumber: string;
  department: string;
  attempt1: number;
  attempt2: number;
}

export interface ScoreRange {
  range: string;
  attempt1Count: number;
  attempt2Count: number;
}

export interface DepartmentStats {
  name: string;
  totalStudents: number;
  attempt1Average: number;
  attempt2Average: number;
  improvement: number;
  scoreRanges: ScoreRange[];
  highestScoreA1: number;
  highestScoreA2: number;
  lowestScore: number;
  passRate: number;
  topPerformers: number;
}

export interface OverallStats {
  totalStudents: number;
  departments: DepartmentStats[];
  overallAttempt1Average: number;
  overallAttempt2Average: number;
  overallImprovement: number;
  scoreRanges: {
    range: string;
    attempt1Count: number;
    attempt2Count: number;
  }[];
}

const SCORE_RANGES = [
  { min: 0, max: 20, label: '0-20' },
  { min: 21, max: 40, label: '21-40' },
  { min: 41, max: 60, label: '41-60' },
  { min: 61, max: 80, label: '61-80' },
  { min: 81, max: 100, label: '81-100' }
];

export const readExcelFile = async (): Promise<StudentData[]> => {
  try {
    const response = await fetch('/Product Company Assessment Mark (Responses).xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    return jsonData.map((row: any) => {
      // Clean and parse the attempt percentages
      const attempt1 = parseFloat(String(row['ATTEMPT 1 (% percentage)'] || '0').replace(/[^0-9.]/g, ''));
      const attempt2 = parseFloat(String(row['ATTEMPT 2 (% percentage)'] || '0').replace(/[^0-9.]/g, ''));
      
      return {
        name: row['NAME'] || '',
        rollNumber: row['ROLL NUM'] || '',
        department: row['DEPARTMENT'] || '',
        attempt1: isNaN(attempt1) ? 0 : attempt1,
        attempt2: isNaN(attempt2) ? 0 : attempt2
      };
    });
  } catch (error) {
    console.error('Error reading Excel file:', error);
    throw error;
  }
};

const calculateScoreRanges = (students: StudentData[], getScore: (student: StudentData) => number) => {
  return SCORE_RANGES.map(range => ({
    range: range.label,
    count: students.filter(student => {
      const score = getScore(student);
      return score >= range.min && score <= range.max;
    }).length
  }));
};

export const calculateStatistics = (data: StudentData[]): OverallStats => {
  const departments = new Map<string, StudentData[]>();
  
  // Group students by department
  data.forEach(student => {
    const deptStudents = departments.get(student.department) || [];
    deptStudents.push(student);
    departments.set(student.department, deptStudents);
  });

  // Calculate department-wise statistics
  const departmentStats: DepartmentStats[] = Array.from(departments.entries()).map(([name, students]) => {
    const attempt1Average = students.reduce((sum, student) => sum + student.attempt1, 0) / students.length;
    const attempt2Average = students.reduce((sum, student) => sum + student.attempt2, 0) / students.length;
    const improvement = attempt2Average - attempt1Average;
    const highestScoreA1 = Math.max(...students.map(student => student.attempt1));
    const highestScoreA2 = Math.max(...students.map(student => student.attempt2));
    const lowestScore = Math.min(...students.map(student => student.attempt2));
    const passRate = (students.filter(student => student.attempt2 >= 60).length / students.length) * 100;
    const topPerformers = students.filter(student => student.attempt2 >= 80).length;

    return {
      name,
      totalStudents: students.length,
      attempt1Average,
      attempt2Average,
      improvement,
      scoreRanges: SCORE_RANGES.map(range => ({
        range: range.label,
        attempt1Count: students.filter(student => 
          student.attempt1 >= range.min && student.attempt1 <= range.max
        ).length,
        attempt2Count: students.filter(student => 
          student.attempt2 >= range.min && student.attempt2 <= range.max
        ).length
      })),
      highestScoreA1,
      highestScoreA2,
      lowestScore,
      passRate,
      topPerformers
    };
  });

  // Calculate overall statistics
  const overallAttempt1Average = data.reduce((sum, student) => sum + student.attempt1, 0) / data.length;
  const overallAttempt2Average = data.reduce((sum, student) => sum + student.attempt2, 0) / data.length;
  const overallImprovement = overallAttempt2Average - overallAttempt1Average;

  return {
    totalStudents: data.length,
    departments: departmentStats,
    overallAttempt1Average,
    overallAttempt2Average,
    overallImprovement,
    scoreRanges: SCORE_RANGES.map(range => ({
      range: range.label,
      attempt1Count: data.filter(student => 
        student.attempt1 >= range.min && student.attempt1 <= range.max
      ).length,
      attempt2Count: data.filter(student => 
        student.attempt2 >= range.min && student.attempt2 <= range.max
      ).length
    }))
  };
}; 