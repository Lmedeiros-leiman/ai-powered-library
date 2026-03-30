using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Data;

    

[Table("Subjects")]
public class Subject
{
    [Column("Id")]
    [Key]
    public int Id { get; set; }

    [Column("Label")]
    public required string Label { get; set; }

    public ICollection<Book> Books { get; set; } = [];
}