using BoardGameTracker.Common.Entities;
using BoardGameTracker.Core.Datastore.Interfaces;

namespace BoardGameTracker.Core.Datastore.Interfaces;

public interface IScoreSheetTemplateRepository : ICrudHelper<ScoreSheetTemplate>
{
    Task<IEnumerable<ScoreSheetTemplate>> GetTemplatesByGame(int gameId);
}
