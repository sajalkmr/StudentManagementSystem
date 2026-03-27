import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { StudentService, StudentData, StudentResultData } from '../../services/student.service';

export interface ClassStats {
  total: number;
  pass: number;
  fail: number;
  avgScore: number;
  topStudent: string;
}

export interface ClassGroup {
  key: string;    // "8-A"
  label: string;  // "Sem 8 - Sec A"
  students: StudentData[];
}

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './report.component.html',
  styleUrl: './report.component.css'
})
export class ReportComponent implements OnInit {
  students = signal<StudentData[]>([]);
  classes = signal<ClassGroup[]>([]);

  selectedClass = signal<ClassGroup | null>(null);
  classStats = signal<ClassStats | null>(null);
  classPieChart = signal<ChartConfiguration | null>(null);
  classBarChart = signal<ChartConfiguration | null>(null);

  selectedStudent = signal<StudentData | null>(null);
  studentResults = signal<StudentResultData | null>(null);
  studentBarChart = signal<ChartConfiguration | null>(null);
  isLoading = signal(false);

  constructor(private studentService: StudentService) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getStudents().subscribe({
      next: (students) => {
        this.students.set(students);
        this.buildClasses(students);
      },
      error: (err) => console.error('Error loading students:', err)
    });
  }

  buildClasses(students: StudentData[]): void {
    const map = new Map<string, StudentData[]>();
    for (const s of students) {
      const key = `${s.semester ?? 0}-${(s.section ?? '').toUpperCase()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }

    const groups: ClassGroup[] = [];
    for (const [key, studs] of map.entries()) {
      const [sem, sec] = key.split('-');
      groups.push({ key, label: `Sem ${sem} - Sec ${sec}`, students: studs });
    }
    groups.sort((a, b) => a.key.localeCompare(b.key));
    this.classes.set(groups);

    if (groups.length > 0) this.onClassSelect(groups[0]);
  }

  onClassSelect(group: ClassGroup): void {
    this.selectedClass.set(group);
    this.selectedStudent.set(null);
    this.studentResults.set(null);
    this.studentBarChart.set(null);
    this.buildClassCharts(group);
  }

  buildClassCharts(group: ClassGroup): void {
    const withMarks = group.students.filter(s => s.marks && s.marks.length > 0);
    if (withMarks.length === 0) {
      this.classStats.set(null);
      this.classPieChart.set(null);
      this.classBarChart.set(null);
      return;
    }

    // Compute stats
    let pass = 0, fail = 0, totalAvg = 0, topAvg = -1, topStudent = '';
    for (const s of withMarks) {
      const avg = s.marks.reduce((a, b) => a + b, 0) / s.marks.length;
      totalAvg += avg;
      avg >= 50 ? pass++ : fail++;
      if (avg > topAvg) { topAvg = avg; topStudent = s.name; }
    }
    this.classStats.set({
      total: withMarks.length, pass, fail,
      avgScore: Math.round(totalAvg / withMarks.length),
      topStudent
    });

    // Pie: pass/fail for this class
    this.classPieChart.set({
      type: 'pie',
      data: {
        labels: ['Pass (avg >= 50)', 'Fail (avg < 50)'],
        datasets: [{
          data: [pass, fail],
          backgroundColor: ['#555555', '#999999'],
          borderColor: ['#444444', '#888888'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed as number;
                const pct = ((val / withMarks.length) * 100).toFixed(1);
                return ` ${ctx.label}: ${val} student${val !== 1 ? 's' : ''} (${pct}%)`;
              }
            }
          }
        }
      }
    });

    // Bar: class average per subject
    const ref = withMarks.find(s => s.subjects && s.subjects.length === s.marks.length);
    const subjectCount = ref ? ref.subjects!.length : withMarks[0].marks.length;
    const subjectLabels = ref
      ? ref.subjects!
      : Array.from({ length: subjectCount }, (_, i) => `Sub ${i + 1}`);

    const sums = Array(subjectCount).fill(0);
    const counts = Array(subjectCount).fill(0);
    for (const s of withMarks) {
      for (let i = 0; i < Math.min(s.marks.length, subjectCount); i++) {
        sums[i] += s.marks[i]; counts[i]++;
      }
    }
    const avgs = sums.map((sum, i) => counts[i] > 0 ? Math.round(sum / counts[i]) : 0);

    this.classBarChart.set({
      type: 'bar',
      data: {
        labels: subjectLabels,
        datasets: [{
          label: 'Class Average',
          data: avgs,
          backgroundColor: avgs.map(a => a >= 50 ? '#555555' : '#999999'),
          borderColor: avgs.map(a => a >= 50 ? '#444444' : '#888888'),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 } } },
        plugins: { legend: { display: false } }
      }
    });
  }

  onStudentSelect(student: StudentData): void {
    if (this.selectedStudent()?.id === student.id) {
      // toggle off if same student clicked
      this.selectedStudent.set(null);
      this.studentResults.set(null);
      this.studentBarChart.set(null);
      return;
    }
    this.selectedStudent.set(student);
    this.isLoading.set(true);
    this.studentService.getStudentResult(student.id!).subscribe({
      next: (results: StudentResultData) => {
        this.studentResults.set(results);
        this.buildStudentBarChart(results);
        this.isLoading.set(false);
      },
      error: (err: any) => { console.error(err); this.isLoading.set(false); }
    });
  }

  buildStudentBarChart(result: StudentResultData): void {
    const labels = (result.subjects && result.subjects.length === result.marks.length)
      ? result.subjects
      : result.marks.map((_, i) => `Sub ${i + 1}`);
    this.studentBarChart.set({
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Marks',
          data: result.marks,
          backgroundColor: result.marks.map(m => m >= 50 ? '#555555' : '#999999'),
          borderColor: result.marks.map(m => m >= 50 ? '#444444' : '#888888'),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: { y: { beginAtZero: true, max: 100, ticks: { stepSize: 10 } } },
        plugins: { legend: { display: false } }
      }
    });
  }

  getStudentAvg(student: StudentData): number {
    if (!student.marks || student.marks.length === 0) return 0;
    return Math.round(student.marks.reduce((a, b) => a + b, 0) / student.marks.length);
  }

  getGradeColor(grade: string): string {
    switch (grade) {
      case 'A': return '#333333';
      case 'B': return '#444444';
      case 'C': return '#666666';
      case 'D': return '#777777';
      default:  return '#999999';
    }
  }
}
