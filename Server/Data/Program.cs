using Data;
using Microsoft.EntityFrameworkCore;

const string ratingsFilePath = "/home/frytura/Documentos/Projects/ai-powered-library/Server/Data/OpenLibraryData/ol_dump_ratings_2026-02-28.txt";
const string SqliteFilePath = "/home/frytura/Documentos/Projects/ai-powered-library/Server/Data/output.db";

var options = new DbContextOptionsBuilder<SqLiteDbContext>()
    .UseSqlite($"Data Source={SqliteFilePath}")
    .Options;

using var dbContext = new SqLiteDbContext(options);
await dbContext.Database.EnsureCreatedAsync();
dbContext.ChangeTracker.AutoDetectChangesEnabled = false;

// load book entity ids from DB for validation
var bookEntityIds = dbContext.Books.Select(b => b.EntityId).ToHashSet();
Console.WriteLine($"Loaded {bookEntityIds.Count} books from DB.");

using var reader = new StreamReader(ratingsFilePath);

const int BatchSize = 1_000;
int totalCount = 0;
var ratingBatch = new List<Rating>();

string? line;

while ((line = reader.ReadLine()) != null)
{
    try
    {
        string[] parts = line.Split('\t');

        var workEntityId = parts[0].Split("/").Last();
        var editionEntityId = string.IsNullOrWhiteSpace(parts[1]) ? null : parts[1].Split("/").Last();
        var score = int.Parse(parts[2]);
        var ratedAt = DateTime.Parse(parts[3]);

        // skip if work not in DB
        if (!bookEntityIds.Contains(workEntityId)) continue;

        var rating = new Rating
        {
            Id = 0,
            WorkEntityId = workEntityId,
            EditionEntityId = editionEntityId,
            Score = score,
            RatedAt = ratedAt
        };

        ratingBatch.Add(rating);
        totalCount++;

        if (ratingBatch.Count >= BatchSize)
        {
            await dbContext.Ratings.AddRangeAsync(ratingBatch);
            await dbContext.SaveChangesAsync();
            ratingBatch.Clear();
            Console.WriteLine($"Inserted {totalCount} ratings...");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error processing line: {ex.Message}");
        continue;
    }
}

// insert remaining
if (ratingBatch.Count > 0)
{
    await dbContext.Ratings.AddRangeAsync(ratingBatch);
    await dbContext.SaveChangesAsync();
}

Console.WriteLine($"Done! Total inserted: {totalCount} ratings.");