using BoardGameTracker.Common.Entities;
using BoardGameTracker.Core.Datastore.Interfaces;
using BoardGameTracker.Core.ScoreSheets.Interfaces;

namespace BoardGameTracker.Core.ScoreSheets;

public class ScoreSheetTemplateService : IScoreSheetTemplateService
{
    private readonly IScoreSheetTemplateRepository _repository;

    public ScoreSheetTemplateService(IScoreSheetTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ScoreSheetTemplate>> GetAllTemplates()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<ScoreSheetTemplate> GetTemplateById(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<ScoreSheetTemplate> Create(ScoreSheetTemplate template)
    {
        template.CreatedAt = DateTime.UtcNow;
        template.UpdatedAt = DateTime.UtcNow;
        return await _repository.CreateAsync(template);
    }

    public async Task<ScoreSheetTemplate> Update(ScoreSheetTemplate template)
    {
        template.UpdatedAt = DateTime.UtcNow;
        return await _repository.UpdateAsync(template);
    }

    public async Task Delete(int id)
    {
        await _repository.DeleteAsync(id);
    }

    public async Task<IEnumerable<ScoreSheetTemplate>> GetTemplatesByGame(int gameId)
    {
        return await _repository.GetTemplatesByGame(gameId);
    }
}