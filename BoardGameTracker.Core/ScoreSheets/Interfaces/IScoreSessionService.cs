using BoardGameTracker.Common.Entities;

namespace BoardGameTracker.Core.ScoreSheets.Interfaces;

public interface IScoreSessionService
{
    Task<IEnumerable<ScoreSession>> GetAllSessions();
    Task<ScoreSession> GetSessionById(int id);
    Task<ScoreSession> Create(ScoreSession session);
    Task<ScoreSession> Update(ScoreSession session);
    Task Delete(int id);
    Task<ScoreSession> CompleteSession(int id);
    Task<IEnumerable<ScoreSession>> GetSessionsByGame(int gameId);
    Task<IEnumerable<ScoreSession>> GetSessionsByUser(string userId);
}