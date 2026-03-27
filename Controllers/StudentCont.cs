using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentMgmt.Data;
using StudentMgmt.Models;

[ApiController]
[Route("api/student")]
public class StudentCont : ControllerBase {
    private readonly AppDbContext _context;

    public StudentCont(AppDbContext context) {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> RegisterStudent([FromBody] Student student) {
        if (student == null
            || string.IsNullOrWhiteSpace(student.Name)
            || string.IsNullOrWhiteSpace(student.USN)
            || string.IsNullOrWhiteSpace(student.Section)
            || student.Semester < 1
            || student.Marks == null)
            return BadRequest("Invalid student payload.");

        var usnExists = await _context.Students.AnyAsync(s => s.USN == student.USN);
        if (usnExists)
            return Conflict($"A student with USN '{student.USN}' is already registered.");

        var entity = new Student {
            Name = student.Name,
            USN = student.USN,
            Semester = student.Semester,
            Section = student.Section,
            Subjects = student.Subjects,
            Marks = student.Marks
        };

        _context.Students.Add(entity);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetStudentById), new { id = entity.Id }, entity);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateStudent(int id, [FromBody] Student student) {
        if (student == null
            || string.IsNullOrWhiteSpace(student.Name)
            || string.IsNullOrWhiteSpace(student.USN)
            || string.IsNullOrWhiteSpace(student.Section)
            || student.Semester < 1
            || student.Marks == null)
            return BadRequest("Invalid student payload.");

        var existingStudent = await _context.Students.FindAsync(id);
        if (existingStudent == null)
            return NotFound();

        existingStudent.Name = student.Name;
        existingStudent.USN = student.USN;
        existingStudent.Semester = student.Semester;
        existingStudent.Section = student.Section;
        existingStudent.Subjects = student.Subjects;
        existingStudent.Marks = student.Marks;

        await _context.SaveChangesAsync();

        return Ok(existingStudent);
    }

    [HttpGet]
    public async Task<IActionResult> GetAllStudents() {
        var students = await _context.Students.AsNoTracking().ToListAsync();
        return Ok(students);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetStudentById(int id) {
        var student = await _context.Students.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        if (student == null) return NotFound();
        return Ok(student);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteStudent(int id) {
        var student = await _context.Students.FindAsync(id);
        if (student == null)
            return NotFound();

        _context.Students.Remove(student);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:int}/marks")]
    public async Task<IActionResult> UpdateStudentMarks(int id, [FromBody] MarksUpdateRequest request) {
        if (request?.Marks == null || request.Marks.Count == 0)
            return BadRequest("Marks are required for update.");

        if (request.Subjects == null || request.Subjects.Count != request.Marks.Count)
            return BadRequest("Subject names and marks count must match.");

        if (request.Subjects.Any(string.IsNullOrWhiteSpace))
            return BadRequest("All subject names are required.");

        if (request.Marks.Any(mark => mark < 0 || mark > 100))
            return BadRequest("All marks must be between 0 and 100.");

        var student = await _context.Students.FindAsync(id);
        if (student == null)
            return NotFound();

        student.Subjects = request.Subjects;
        student.Marks = request.Marks;
        await _context.SaveChangesAsync();

        return Ok(student);
    }

    [HttpGet("{id:int}/result")]
    public async Task<IActionResult> GetStudentResult(int id) {
        var student = await _context.Students.AsNoTracking().FirstOrDefaultAsync(s => s.Id == id);
        if (student == null)
            return NotFound();

        if (student.Marks == null || student.Marks.Count == 0)
            return BadRequest("No marks available for this student.");

        var total = student.Marks.Sum();
        var avg = student.Marks.Average();
        var result = new StudentResult {
            Id = student.Id,
            Name = student.Name,
            Subjects = student.Subjects ?? new List<string>(),
            Marks = student.Marks,
            Total = total,
            Average = Math.Round(avg, 2),
            Grade = GetGrade(avg)
        };

        return Ok(result);
    }

    private static string GetGrade(double avg) => avg switch
    {
        >= 90 => "A",
        >= 75 => "B",
        >= 60 => "C",
        >= 50 => "D",
        _ => "F"
    };

}