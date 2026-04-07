
import { Student, Teacher, FeeRecord, Result, DashboardStats, LeaveRequest, SalaryRecord, OperationCost, AttendanceRecord, ClassRates } from '../types';

const STORAGE_KEYS = {
  STUDENTS: 'edu_students_v1',
  TEACHERS: 'edu_teachers_v1',
  FEES: 'edu_fees_v1',
  RESULTS: 'edu_results_v1',
  LEAVES: 'edu_leaves_v1',
  SALARIES: 'edu_salaries_v1',
  COSTS: 'edu_costs_v1',
  ATTENDANCE: 'edu_attendance_v1',
  RATES: 'edu_rates_v1'
};

const initializeData = () => {
  Object.values(STORAGE_KEYS).forEach(key => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([]));
  });
};

initializeData();

export const dataService = {
  getRates: (): ClassRates[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.RATES) || '[]'),
  saveRates: (rates: ClassRates[]) => {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  },

  getStudents: (): Student[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]'),
  saveStudent: (student: Omit<Student, 'id'>) => {
    const students = dataService.getStudents();
    const duplicate = students.find(s => s.roll === student.roll && s.className === student.className);
    if (duplicate) throw new Error(`Roll ${student.roll} already exists in ${student.className}`);
    const newStudent = { ...student, id: Date.now().toString() };
    students.push(newStudent);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return newStudent;
  },
  updateStudent: (student: Student) => {
    const students = dataService.getStudents();
    const index = students.findIndex(s => s.id === student.id);
    if (index !== -1) {
      students[index] = student;
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    }
  },
  deleteStudent: (id: string) => {
    const students = dataService.getStudents();
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students.filter(s => s.id !== id)));
  },

  getTeachers: (): Teacher[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]'),
  saveTeacher: (teacher: Omit<Teacher, 'id'>) => {
    const teachers = dataService.getTeachers();
    const newTeacher = { ...teacher, id: Date.now().toString() };
    teachers.push(newTeacher);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    return newTeacher;
  },
  updateTeacher: (teacher: Teacher) => {
    const teachers = dataService.getTeachers();
    const index = teachers.findIndex(t => t.id === teacher.id);
    if (index !== -1) {
      teachers[index] = teacher;
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    }
  },

  getAttendance: (): AttendanceRecord[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]'),
  markAttendance: (record: Omit<AttendanceRecord, 'id' | 'time'>) => {
    const attendance = dataService.getAttendance();
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();
    const filtered = attendance.filter(a => !(a.entityId === record.entityId && a.date === today));
    const newRecord = { ...record, id: Date.now().toString(), time, date: today };
    filtered.push(newRecord);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(filtered));
    return newRecord;
  },

  getFees: (): FeeRecord[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.FEES) || '[]'),
  
  getStudentBalance: (roll: string): number => {
    const fees = dataService.getFees();
    const studentFees = fees.filter(f => f.studentRoll === roll);
    const totalPayable = studentFees.reduce((acc, f) => acc + (f.total - f.previousDue), 0);
    const totalPaid = studentFees.reduce((acc, f) => acc + f.paidAmount, 0);
    return Math.max(0, totalPayable - totalPaid);
  },

  saveFee: (fee: Omit<FeeRecord, 'id'>) => {
    const fees = dataService.getFees();
    const newFee = { ...fee, id: Date.now().toString() };
    fees.push(newFee);
    localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(fees));
    return newFee;
  },

  getResults: (): Result[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.RESULTS) || '[]'),
  saveResult: (result: Omit<Result, 'id' | 'grade' | 'status'>) => {
    const results = dataService.getResults();
    const m = result.marks;
    const status = m >= 33 ? 'Pass' : 'Fail';
    let grade = 'F';
    if (m >= 80) grade = 'A+';
    else if (m >= 70) grade = 'A';
    else if (m >= 60) grade = 'A-';
    else if (m >= 50) grade = 'B';
    else if (m >= 40) grade = 'C';
    else if (m >= 33) grade = 'D';

    const newResult = { ...result, id: Date.now().toString(), status, grade } as Result;
    results.push(newResult);
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    return newResult;
  },
  updateResult: (result: Result) => {
    const results = dataService.getResults();
    const m = result.marks;
    const status = m >= 33 ? 'Pass' : 'Fail';
    let grade = 'F';
    if (m >= 80) grade = 'A+';
    else if (m >= 70) grade = 'A';
    else if (m >= 60) grade = 'A-';
    else if (m >= 50) grade = 'B';
    else if (m >= 40) grade = 'C';
    else if (m >= 33) grade = 'D';

    const index = results.findIndex(r => r.id === result.id);
    if (index !== -1) {
      results[index] = { ...result, status, grade };
      localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(results));
    }
  },

  getLeaves: (): LeaveRequest[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.LEAVES) || '[]'),
  saveLeave: (leave: Omit<LeaveRequest, 'id'>) => {
    const leaves = dataService.getLeaves();
    const newLeave = { ...leave, id: Date.now().toString() };
    leaves.push(newLeave);
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(leaves));
    return newLeave;
  },
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected') => {
    const leaves = dataService.getLeaves();
    const updated = leaves.map(l => l.id === id ? { ...l, status } : l);
    localStorage.setItem(STORAGE_KEYS.LEAVES, JSON.stringify(updated));
  },

  getSalaries: (): SalaryRecord[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.SALARIES) || '[]'),
  saveSalary: (salary: Omit<SalaryRecord, 'id'>) => {
    const salaries = dataService.getSalaries();
    const newSalary = { ...salary, id: Date.now().toString() };
    salaries.push(newSalary);
    localStorage.setItem(STORAGE_KEYS.SALARIES, JSON.stringify(salaries));
    return newSalary;
  },

  getCosts: (): OperationCost[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.COSTS) || '[]'),
  saveCost: (cost: Omit<OperationCost, 'id'>) => {
    const costs = dataService.getCosts();
    const newCost = { ...cost, id: Date.now().toString() };
    costs.push(newCost);
    localStorage.setItem(STORAGE_KEYS.COSTS, JSON.stringify(costs));
    return newCost;
  },
  updateCost: (cost: OperationCost) => {
    const costs = dataService.getCosts();
    const index = costs.findIndex(c => c.id === cost.id);
    if (index !== -1) {
      costs[index] = cost;
      localStorage.setItem(STORAGE_KEYS.COSTS, JSON.stringify(costs));
    }
  },

  getDashboardStats: (): DashboardStats => {
    const students = dataService.getStudents();
    const teachers = dataService.getTeachers();
    const fees = dataService.getFees();
    const results = dataService.getResults();
    const costs = dataService.getCosts();
    const salaries = dataService.getSalaries();
    const leaves = dataService.getLeaves();
    const attendance = dataService.getAttendance();
    const today = new Date().toISOString().split('T')[0];

    const totalRevenue = fees.reduce((acc, f) => acc + f.paidAmount, 0);
    const opCostsTotal = costs.reduce((acc, c) => acc + c.amount, 0);
    const salariesPaid = salaries.filter(s => s.status === 'Paid').reduce((acc, s) => acc + s.total, 0);
    const totalExpenses = opCostsTotal + salariesPaid;

    const totalDueFees = students.reduce((acc, s) => acc + dataService.getStudentBalance(s.roll), 0);
    const totalDueSalaries = salaries.filter(s => s.status === 'Pending').reduce((acc, s) => acc + s.total, 0);

    const activeLeaves = leaves.filter(l => l.status === 'Approved' && today >= l.startDate && today <= l.endDate);
    const studentsOnLeave = activeLeaves.filter(l => l.type === 'Student').length;
    const teachersOnLeave = activeLeaves.filter(l => l.type === 'Teacher').length;

    const passCount = results.filter(r => r.status === 'Pass').length;
    const passRate = results.length > 0 ? (passCount / results.length) * 100 : 0;

    const todayAttendance = attendance.filter(a => a.date === today && a.type === 'Student');
    const presentCount = todayAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const feeTrends = months.map(month => ({
      month,
      amount: fees.filter(f => f.month === month).reduce((acc, f) => acc + f.paidAmount, 0)
    }));

    return {
      totalStudents: students.length,
      studentsOnLeave,
      totalTeachers: teachers.length,
      teachersOnLeave,
      totalRevenue,
      totalExpenses,
      totalDueFees,
      totalDueSalaries,
      passRate,
      attendanceToday: {
        present: presentCount,
        absent: students.length - presentCount,
        total: students.length
      },
      feeTrends
    };
  }
};
