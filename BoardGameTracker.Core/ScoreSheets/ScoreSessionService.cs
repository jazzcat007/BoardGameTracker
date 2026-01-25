using BoardGameTracker.Common.Entities;
using BoardGameTracker.Core.Datastore.Interfaces;
using BoardGameTracker.Core.ScoreSheets.Interfaces;

namespace BoardGameTracker.Core.ScoreSheets;

public class ScoreSessionService : IScoreSessionService
{
    private readonly IScoreSessionRepository _repository;

    public ScoreSessionService(IScoreSessionRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ScoreSession>> GetAllSessions()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<ScoreSession> GetSessionById(int id)
    {
        return await _repository.GetByIdAsync(id);
    }

    public async Task<ScoreSession> Create(ScoreSession session)
    {
        session.CreatedAt = DateTime.UtcNow;
        session.UpdatedAt = DateTime.UtcNow;
        return await _repository.CreateAsync(session);
    }

    public async Task<ScoreSession> Update(ScoreSession session)
    {
        session.UpdatedAt = DateTime.UtcNow;
        return await _repository.UpdateAsync(session);
    }

    public async Task Delete(int id)
    {
        await _repository.DeleteAsync(id);
    }

    public async Task<ScoreSession> CompleteSession(int id)
    {
        var session = await _repository.GetByIdAsync(id);
        if (session == null)
        {
            throw new Exception("Session not found");
        }

        session.IsCompleted = true;
        session.FinishedAt = DateTime.UtcNow;
        session.UpdatedAt = DateTime.UtcNow;

        return await _repository.UpdateAsync(session);
    }

    public async Task<IEnumerable<ScoreSession>> GetSessionsByGame(int gameId)
    {
        return await _repository.GetSessionsByGame(gameId);
    }

    public async Task<IEnumerable<ScoreSession>> GetSessionsByUser(string userId)
    {
        return await _repository.GetSessionsByUser(userId);
    }
}