using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentMgmt.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subjects = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: ""),
                    Marks = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: ""),
                    USN = table.Column<string>(type: "nvarchar(450)", nullable: false, defaultValue: ""),
                    Semester = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    Section = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Students", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Students_USN",
                table: "Students",
                column: "USN",
                unique: true,
                filter: "[USN] != ''");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Students");
        }
    }
}
