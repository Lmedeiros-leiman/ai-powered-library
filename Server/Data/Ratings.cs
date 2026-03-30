using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Data;

[Table("Ratings")]
public class Rating
{
    [Column("Id")]
    [Key]
    public int Id { get; set; }

    [Column("WorkEntityId")]
    public required string WorkEntityId { get; set; } // links to Book.EntityId

    [Column("EditionEntityId")]
    public string? EditionEntityId { get; set; } = null;

    [Column("Score")]
    public int Score { get; set; }

    [Column("RatedAt")]
    public DateTime RatedAt { get; set; }
}