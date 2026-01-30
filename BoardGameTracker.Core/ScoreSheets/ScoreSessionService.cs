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
        if (session == null)
            throw new ArgumentNullException(nameof(session));
        
        ValidateSession(session);
        
        session.CreatedAt = DateTime.UtcNow;
        session.UpdatedAt = DateTime.UtcNow;
        return await _repository.CreateAsync(session);
    }

    public async Task<ScoreSession> Update(ScoreSession session)
    {
        if (session == null)
            throw new ArgumentNullException(nameof(session));
        
        if (session.Id == 0)
            throw new ArgumentException("Session Id is required for update", nameof(session));
        
        ValidateSession(session);
        
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
            throw new InvalidOperationException($"Session with id {id} not found");
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

    private void ValidateSession(ScoreSession session)
    {
        if (string.IsNullOrWhiteSpace(session.Name))
            throw new ArgumentException("Session name is required", nameof(session));
        
        if (session.ScoreSheetTemplateId == 0)
            throw new ArgumentException("ScoreSheetTemplateId is required", nameof(session));
    }
}