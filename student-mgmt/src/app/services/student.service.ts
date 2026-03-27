import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StudentData {
  id?: number;
  name: string;
  subjects?: string[];
  marks: number[];
  usn?: string;
  semester?: number;
  section?: string;
}

export interface StudentResultData {
  id: number;
  name: string;
  subjects: string[];
  marks: number[];
  total: number;
  average: number;
  grade: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registerStudent(student: StudentData): Observable<StudentData> {
    return this.http.post<StudentData>(`${this.apiUrl}/register`, student);
  }

  updateStudent(id: number, student: StudentData): Observable<StudentData> {
    return this.http.put<StudentData>(`${this.apiUrl}/${id}`, student);
  }

  getStudents(): Observable<StudentData[]> {
    return this.http.get<StudentData[]>(this.apiUrl);
  }

  getStudent(id: number): Observable<StudentData> {
    return this.http.get<StudentData>(`${this.apiUrl}/${id}`);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateStudentMarks(id: number, subjects: string[], marks: number[]): Observable<StudentData> {
    return this.http.post<StudentData>(`${this.apiUrl}/${id}/marks`, { subjects, marks });
  }

  getStudentResult(id: number): Observable<StudentResultData> {
    return this.http.get<StudentResultData>(`${this.apiUrl}/${id}/result`);
  }
}

