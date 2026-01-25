using BoardGameTracker.Common.Entities.Helpers;

namespace BoardGameTracker.Common.Entities;

public class ScoreSession : HasId
{
    public string Name { get; set; }
    public int ScoreSheetTemplateId { get; set; }
    public ScoreSheetTemplate ScoreSheetTemplate { get; set; }
    public string TemplateVersionSnapshot { get; set; }
    public string JsonData { get; set; }
    public int? GameId { get; set; }
    public Game Game { get; set; }
    public int? LocationId { get; set; }
    public Location Location { get; set; }
    public string CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; }
    public string Notes { get; set; }
    public bool IsCompleted { get; set; } = false;
}