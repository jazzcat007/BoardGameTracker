using BoardGameTracker.Common.Entities.Helpers;

namespace BoardGameTracker.Common.Entities;

public class ScoreSheetTemplate : HasId
{
    public string Name { get; set; }
    public string Description { get; set; }
    public string Mode { get; set; } // "rounds" | "categories" | "hybrid"
    public int MinPlayers { get; set; } = 1;
    public int MaxPlayers { get; set; } = 10;
    public string Version { get; set; } = "1.0";
    public string JsonDefinition { get; set; }
    public int? GameId { get; set; }
    public Game Game { get; set; }
    public bool IsPublic { get; set; } = false;
    public string CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}