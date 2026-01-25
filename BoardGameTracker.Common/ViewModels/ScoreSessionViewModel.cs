namespace BoardGameTracker.Common.ViewModels;

public class ScoreSessionViewModel
{
    public int? Id { get; set; }
    public string Name { get; set; }
    public int ScoreSheetTemplateId { get; set; }
    public string TemplateVersionSnapshot { get; set; }
    public string JsonData { get; set; }
    public int? GameId { get; set; }
    public int? LocationId { get; set; }
    public string CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; }
    public string Notes { get; set; }
    public bool IsCompleted { get; set; } = false;
}