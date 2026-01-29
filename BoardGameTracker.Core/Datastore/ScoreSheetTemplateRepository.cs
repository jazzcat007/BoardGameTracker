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

    public override async Task<ScoreSheetTemplate?> GetByIdAsync(int id)
    {
        return await _dbContext.ScoreSheetTemplates
            .Include(t => t.Game)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public override async Task<List<ScoreSheetTemplate>> GetAllAsync()
    {
        return await _dbContext.ScoreSheetTemplates
            .Include(t => t.Game)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<ScoreSheetTemplate>> GetTemplatesByGame(int gameId)
    {
        return await _dbContext.ScoreSheetTemplates
            .Include(t => t.Game)
            .Where(t => t.GameId == gameId)
            .ToListAsync();
    }
}
