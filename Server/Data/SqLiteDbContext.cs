namespace Data;
using Microsoft.EntityFrameworkCore;

public class SqLiteDbContext(DbContextOptions<SqLiteDbContext> options) : DbContext(options)
{
    public DbSet<Author> Authors { get; set; }
    public DbSet<Book> Books { get; set; }
    public DbSet<Subject> Subjects { get; set; }
    public DbSet<Rating> Ratings { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Author>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.EntityId).IsRequired();
            entity.Property(e => e.Name).IsRequired();
            entity.Property(e => e.RegisteredAt).IsRequired();
            entity.Property(e => e.LatestRevision).IsRequired();
            entity.Property(e => e.Revision).IsRequired();
            entity.Property(e => e.LastModified).IsRequired(false); // nullable
        });

        modelBuilder.Entity<Book>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.EntityId).IsRequired();
            entity.Property(e => e.Title).IsRequired();
            entity.Property(e => e.AuthorEntityId).IsRequired();
            entity.Property(e => e.LatestRevision).IsRequired();
            entity.Property(e => e.Revision).IsRequired();
            entity.Property(e => e.CreatedAt).IsRequired(false);
            entity.Property(e => e.LastModified).IsRequired(false);

            entity.HasMany(e => e.Subjects)
                  .WithMany(e => e.Books); // EF Core auto-creates the junction table
        });

        modelBuilder.Entity<Subject>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();
            entity.Property(e => e.Label).IsRequired();
        });
    }
}