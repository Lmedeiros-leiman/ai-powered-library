using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Data;

[Table("Books")]
[Index(nameof(EntityId), IsUnique = true)]
public class Book
{
    [Column("Id")]
    [Key]
    public int Id { get; set; }

    [Column("EntityId")]
    public required string EntityId { get; set; }

    [Column("Title")]
    public required string Title { get; set; }

    [Column("AuthorEntityId")]
    public required string AuthorEntityId { get; set; }

    [Column("LatestRevision")]
    public int LatestRevision { get; set; }

    [Column("Revision")]
    public int Revision { get; set; }

    [Column("CreatedAt")]
    public DateTime? CreatedAt { get; set; } = null;

    [Column("LastModified")]
    public DateTime? LastModified { get; set; } = null;

    public ICollection<Subject> Subjects { get; set; } = [];
}