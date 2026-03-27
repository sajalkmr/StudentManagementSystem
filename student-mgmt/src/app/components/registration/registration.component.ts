import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService, StudentData } from '../../services/student.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  name = signal('');
  subjects = signal(5);
  message = signal('');
  isLoading = signal(false);
  students = signal<StudentData[]>([]);
  usn = signal('');
  semester = signal(1);
  section = signal('');

  
  editingStudent = signal<StudentData | null>(null);
  editName = signal('');
  editUsn = signal('');
  editSemester = signal(1);
  editSection = signal('');
  isSaving = signal(false);

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

  onSubmit(): void {
    if (!this.name().trim()) {
      this.message.set('Please enter a student name');
      return;
    }

    if (!this.usn().trim()) {
      this.message.set('Please enter a USN');
      return;
    }

    if (!this.section().trim()) {
      this.message.set('Please enter a section');
      return;
    }

    if (this.semester() < 1 || this.semester() > 8) {
      this.message.set('Please enter a semester between 1 and 8');
      return;
    }

    if (this.subjects() < 1) {
      this.message.set('Please enter number of subjects');
      return;
    }

    this.isLoading.set(true);
    const subjectCount = Math.max(1, this.subjects());
    const subjects = Array(subjectCount).fill(0).map((_, i) => `Subject ${i + 1}`);
    const student = {
      name: this.name().trim(),
      usn: this.usn().trim(),
      semester: this.semester(),
      section: this.section().trim(),
      subjects,
      marks: Array(subjectCount).fill(0)
    };

    this.studentService.registerStudent(student).subscribe({
      next: () => {
        this.message.set('Student registered successfully!');
        this.name.set('');
        this.usn.set('');
        this.semester.set(1);
        this.section.set('');
        this.subjects.set(5);
        this.loadStudents();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.message.set('Error registering student: ' + error.message);
        this.isLoading.set(false);
      }
    });
  }

  onDeleteStudent(student: StudentData): void {
    if (!student.id) return;

    if (confirm(`Are you sure you want to delete "${student.name}"?`)) {
      this.studentService.deleteStudent(student.id).subscribe({
        next: () => {
          this.message.set('Student deleted successfully!');
          this.loadStudents();
        },
        error: (error) => {
          this.message.set('Error deleting student');
          console.error('Delete error:', error);
        }
      });
    }
  }

  onEditStudent(student: StudentData): void {
    this.editingStudent.set(student);
    this.editName.set(student.name);
    this.editUsn.set(student.usn || '');
    this.editSemester.set(student.semester || 1);
    this.editSection.set(student.section || '');
    this.message.set('');
  }

  onCancelEdit(): void {
    this.editingStudent.set(null);
  }

  onSaveEdit(): void {
    const student = this.editingStudent();
    if (!student?.id) return;

    if (!this.editName().trim()) {
      this.message.set('Please enter a student name');
      return;
    }
    if (!this.editUsn().trim()) {
      this.message.set('Please enter a USN');
      return;
    }
    if (!this.editSection().trim()) {
      this.message.set('Please enter a section');
      return;
    }
    if (this.editSemester() < 1 || this.editSemester() > 8) {
      this.message.set('Semester must be between 1 and 8');
      return;
    }

    this.isSaving.set(true);
    const updated: StudentData = {
      ...student,
      name: this.editName().trim(),
      usn: this.editUsn().trim(),
      semester: this.editSemester(),
      section: this.editSection().trim(),
    };

    this.studentService.updateStudent(student.id, updated).subscribe({
      next: () => {
        this.message.set('Student updated successfully!');
        this.editingStudent.set(null);
        this.isSaving.set(false);
        this.loadStudents();
      },
      error: (error) => {
        this.message.set('Error updating student: ' + (error.error ?? error.message));
        this.isSaving.set(false);
      }
    });
  }
}
