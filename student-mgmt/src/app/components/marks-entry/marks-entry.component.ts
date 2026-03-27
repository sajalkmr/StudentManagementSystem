import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-marks-entry',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marks-entry.component.html',
  styleUrl: './marks-entry.component.css'
})
export class MarksEntryComponent {
  studentName = signal('');
  selectedStudent = signal<any>(null);
  subjectRows = signal<{ name: string; mark: number }[]>([]);
  students = signal<any[]>([]);
  selectedStudentId = signal<number | null>(null);
  message = signal('');
  isLoading = signal(false);

  constructor(private studentService: StudentService) {
    this.loadStudents();
  }

  loadStudents(): void {
    this.studentService.getStudents().subscribe({
      next: (students) => {
        this.students.set(students);
      },
      error: (error) => {
        console.error('Error loading students:', error);
      }
    });
  }

  onStudentSelect(student: any): void {
    this.studentName.set(student?.name ?? '');
    this.selectedStudentId.set(student?.id ?? null);
    this.selectedStudent.set(student ?? null);

    const subjects = Array.isArray(student?.subjects) && student.subjects.length > 0
      ? student.subjects
      : Array(5).fill('').map((_, i) => `Subject ${i + 1}`);

    const marks = Array.isArray(student?.marks) && student.marks.length > 0
      ? student.marks
      : Array(subjects.length).fill(0);

    this.subjectRows.set(subjects.map((name: string, i: number) => ({ name, mark: Number(marks[i] ?? 0) })));
  }

  onSubjectChange(index: number, name: string): void {
    const rows = [...this.subjectRows()];
    rows[index] = { ...rows[index], name };
    this.subjectRows.set(rows);
  }

  onMarkChange(index: number, mark: number): void {
    const rows = [...this.subjectRows()];
    rows[index] = { ...rows[index], mark };
    this.subjectRows.set(rows);
  }

  addSubject(): void {
    this.subjectRows.set([...this.subjectRows(), { name: '', mark: 0 }]);
  }

  removeSubject(index: number): void {
    const rows = [...this.subjectRows()];
    rows.splice(index, 1);
    this.subjectRows.set(rows);
  }

  onSubmit(): void {
    if (!this.studentName().trim() || !this.selectedStudentId()) {
      this.message.set('Please select a student');
      return;
    }

    const invalidRow = this.subjectRows().find(r => !r.name.trim() || isNaN(r.mark) || r.mark < 0 || r.mark > 100);
    if (invalidRow) {
      this.message.set('Each subject needs a name and mark 0-100.');
      return;
    }

    this.isLoading.set(true);

    const subjects = this.subjectRows().map(r => r.name.trim());
    const marks = this.subjectRows().map(r => r.mark);

    this.studentService.updateStudentMarks(this.selectedStudentId()!, subjects, marks).subscribe({
      next: () => {
        this.message.set('Marks updated successfully!');
        this.isLoading.set(false);
        this.loadStudents();
      },
      error: (error) => {
        this.message.set('Error updating marks: ' + (error.error?.title ?? error.message));
        this.isLoading.set(false);
      }
    });
  }
}
