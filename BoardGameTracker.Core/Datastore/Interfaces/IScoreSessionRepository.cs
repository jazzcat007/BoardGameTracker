using BoardGameTracker.Common.Entities;
using BoardGameTracker.Core.Datastore.Interfaces;

namespace BoardGameTracker.Core.Datastore.Interfaces;

public interface IScoreSessionRepository : ICrudHelper<ScoreSession>
{
    Task<IEnumerable<ScoreSession>> GetSessionsByGame(int gameId);
    Task<IEnumerable<ScoreSession>> GetSessionsByUser(string userId);
}
