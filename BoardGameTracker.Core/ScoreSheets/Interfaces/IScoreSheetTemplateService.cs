using BoardGameTracker.Common.Entities;

namespace BoardGameTracker.Core.ScoreSheets.Interfaces;

public interface IScoreSheetTemplateService
{
    Task<IEnumerable<ScoreSheetTemplate>> GetAllTemplates();
    Task<ScoreSheetTemplate> GetTemplateById(int id);
    Task<ScoreSheetTemplate> Create(ScoreSheetTemplate template);
    Task<ScoreSheetTemplate> Update(ScoreSheetTemplate template);
    Task Delete(int id);
    Task<IEnumerable<ScoreSheetTemplate>> GetTemplatesByGame(int gameId);
}