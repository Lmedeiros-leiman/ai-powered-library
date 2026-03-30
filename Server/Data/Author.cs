using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Data;

[Table("Authors")]
[Index(nameof(EntityId), IsUnique = true)]
public class Author
{
    [Column("Id")]
    [Key]
    public int Id { get; set; }
    [Column("EntityId")]
    public required string EntityId { get; set; }
    [Column("Name")]
    public required string Name { get; set; }
    [Column("RegisteredAt")]
    public DateTime RegisteredAt { get; set; }
    [Column("LatestRevision")]
    public int LatestRevision { get; set; }
    [Column("Revision")]
    public int Revision { get; set; }
    [Column("LastModified")]
    public DateTime? LastModified { get; set; } = null;
}