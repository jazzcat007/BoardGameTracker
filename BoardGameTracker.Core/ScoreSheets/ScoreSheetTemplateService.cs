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
        if (template == null)
            throw new ArgumentNullException(nameof(template));
        
        ValidateTemplate(template);
        
        template.CreatedAt = DateTime.UtcNow;
        template.UpdatedAt = DateTime.UtcNow;
        return await _repository.CreateAsync(template);
    }

    public async Task<ScoreSheetTemplate> Update(ScoreSheetTemplate template)
    {
        if (template == null)
            throw new ArgumentNullException(nameof(template));
        
        if (template.Id == 0)
            throw new ArgumentException("Template Id is required for update", nameof(template));
        
        ValidateTemplate(template);
        
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

    private void ValidateTemplate(ScoreSheetTemplate template)
    {
        if (string.IsNullOrWhiteSpace(template.Name))
            throw new ArgumentException("Template name is required", nameof(template));
        
        if (string.IsNullOrWhiteSpace(template.JsonDefinition))
            throw new ArgumentException("Template JSON definition is required", nameof(template));
        
        if (template.MinPlayers < 1)
            throw new ArgumentException("MinPlayers must be at least 1", nameof(template));
        
        if (template.MaxPlayers < template.MinPlayers)
            throw new ArgumentException("MaxPlayers must be greater than or equal to MinPlayers", nameof(template));
    }
}