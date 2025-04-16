export interface StudentData {
  name: string;
  department: string;
  attempt1: number;
  attempt2: number;
}

export interface DepartmentStats {
  name: string;
  totalStudents: number;
  attempt1Average: number;
  attempt2Average: number;
  improvement: number;
  students: StudentData[];
}

export interface OverallStats {
  totalStudents: number;
  overallAttempt1Average: number;
  overallAttempt2Average: number;
  overallImprovement: number;
  departments: DepartmentStats[];
} 