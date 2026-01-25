namespace BoardGameTracker.Common.ViewModels;

public class ScoreSheetTemplateViewModel
{
    public int? Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }
    public string Mode { get; set; }
    public int MinPlayers { get; set; } = 1;
    public int MaxPlayers { get; set; } = 10;
    public string Version { get; set; } = "1.0";
    public string JsonDefinition { get; set; }
    public int? GameId { get; set; }
    public bool IsPublic { get; set; } = false;
    public string CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}