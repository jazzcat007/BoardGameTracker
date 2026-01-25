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

    public async Task<IEnumerable<ScoreSession>> GetSessionsByGame(int gameId)
    {
        return await _dbContext.ScoreSessions
            .Where(s => s.GameId == gameId)
            .ToListAsync();
    }

    public async Task<IEnumerable<ScoreSession>> GetSessionsByUser(string userId)
    {
        return await _dbContext.ScoreSessions
            .Where(s => s.CreatedByUserId == userId)
            .ToListAsync();
    }
}
