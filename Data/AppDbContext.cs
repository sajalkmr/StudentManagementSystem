using Microsoft.EntityFrameworkCore;
using StudentMgmt.Models;

namespace StudentMgmt.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Student> Students { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Student>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.USN).IsRequired().HasDefaultValue(string.Empty);
                entity.HasIndex(e => e.USN).IsUnique().HasFilter("[USN] != ''");
                entity.Property(e => e.Semester).HasDefaultValue(1);
                entity.Property(e => e.Section).IsRequired().HasDefaultValue(string.Empty);
                entity.Property(e => e.SubjectsCsv).HasColumnName("Subjects").HasDefaultValue(string.Empty);
                entity.Property(e => e.MarksCsv).HasColumnName("Marks").HasDefaultValue(string.Empty);
            });

            base.OnModelCreating(modelBuilder);
        }
    }
}