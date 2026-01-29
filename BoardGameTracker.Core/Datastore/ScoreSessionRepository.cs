using BoardGameTracker.Common.Entities;
using BoardGameTracker.Core.Datastore.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BoardGameTracker.Core.Datastore;

public class ScoreSessionRepository : CrudHelper<ScoreSession>, IScoreSessionRepository
{
    private readonly MainDbContext _dbContext;

    public ScoreSessionRepository(MainDbContext dbContext) : base(dbContext)
    {
        _dbContext = dbContext;
    }

    public override async Task<ScoreSession?> GetByIdAsync(int id)
    {
        return await _dbContext.ScoreSessions
            .Include(s => s.ScoreSheetTemplate)
            .Include(s => s.Game)
            .Include(s => s.Location)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public override async Task<List<ScoreSession>> GetAllAsync()
    {
        return await _dbContext.ScoreSessions
            .Include(s => s.ScoreSheetTemplate)
            .Include(s => s.Game)
            .Include(s => s.Location)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<ScoreSession>> GetSessionsByGame(int gameId)
    {
        return await _dbContext.ScoreSessions
            .Include(s => s.ScoreSheetTemplate)
            .Include(s => s.Game)
            .Include(s => s.Location)
            .Where(s => s.GameId == gameId)
            .ToListAsync();
    }

    public async Task<IEnumerable<ScoreSession>> GetSessionsByUser(string userId)
    {
        return await _dbContext.ScoreSessions
            .Include(s => s.ScoreSheetTemplate)
            .Include(s => s.Game)
            .Include(s => s.Location)
            .Where(s => s.CreatedByUserId == userId)
            .ToListAsync();
    }
}
