using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace StudentMgmt.Models
{
    public class Student {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        [JsonIgnore]
        public string SubjectsCsv { get; set; } = string.Empty;

        [NotMapped]
        public List<string> Subjects {
            get => string.IsNullOrWhiteSpace(SubjectsCsv)
                ? new List<string>()
                : SubjectsCsv.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList();
            set => SubjectsCsv = value is null ? string.Empty : string.Join(',', value);
        }

        
        [JsonIgnore]
        public string MarksCsv { get; set; } = string.Empty;

        [NotMapped]
        public List<int> Marks {
            get => string.IsNullOrWhiteSpace(MarksCsv)
                ? new List<int>()
                : MarksCsv.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToList();
            set => MarksCsv = value is null ? string.Empty : string.Join(',', value);
        }
            public string USN { get; set; } = string.Empty;
            public int Semester { get; set; }
            public string Section { get; set; } = string.Empty;
    }

    public class MarksUpdateRequest {
        public List<string> Subjects { get; set; } = new();
        public List<int> Marks { get; set; } = new();
    }

    public class StudentResult {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<string> Subjects { get; set; } = new();
        public List<int> Marks { get; set; } = new();
        public double Total { get; set; }
        public double Average { get; set; }
        public string Grade { get; set; } = string.Empty;
    }
}