using BoardGameTracker.Common.Entities;
using BoardGameTracker.Core.Datastore.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BoardGameTracker.Core.Datastore;

public class ScoreSheetTemplateRepository : CrudHelper<ScoreSheetTemplate>, IScoreSheetTemplateRepository
{
    private readonly MainDbContext _dbContext;

    public ScoreSheetTemplateRepository(MainDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IEnumerable<ScoreSheetTemplate>> GetTemplatesByGame(int gameId)
    {
        return await _dbContext.ScoreSheetTemplates
            .Where(t => t.GameId == gameId)
            .ToListAsync();
    }
}
