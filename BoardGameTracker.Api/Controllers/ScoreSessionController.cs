using AutoMapper;
using BoardGameTracker.Common.Entities;
using BoardGameTracker.Common.ViewModels;
using BoardGameTracker.Core.ScoreSheets.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BoardGameTracker.Api.Controllers;

[ApiController]
[Route("api/score-session")]
public class ScoreSessionController : ControllerBase
{
    private readonly IScoreSessionService _scoreSessionService;
    private readonly IMapper _mapper;
    private readonly ILogger<ScoreSessionController> _logger;

    public ScoreSessionController(
        IScoreSessionService scoreSessionService,
        IMapper mapper,
        ILogger<ScoreSessionController> logger)
    {
        _scoreSessionService = scoreSessionService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllSessions()
    {
        try
        {
            var sessions = await _scoreSessionService.GetAllSessions();
            var result = _mapper.Map<IEnumerable<ScoreSessionViewModel>>(sessions);
            return new OkObjectResult(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Failed to retrieve all score sessions");
            return StatusCode(500, new { error = "An error occurred while retrieving sessions" });
        }
    }

    [HttpGet]
    [Route("{id:int}")]
    public async Task<IActionResult> GetSessionById(int id)
    {
        try
        {
            var session = await _scoreSessionService.GetSessionById(id);
            if (session == null)
            {
                return new NotFoundResult();
            }
            var result = _mapper.Map<ScoreSessionViewModel>(session);
            return new OkObjectResult(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return StatusCode(500);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession([FromBody] ScoreSessionViewModel viewModel)
    {
        if (viewModel == null)
        {
            return new BadRequestResult();
        }

        try
        {
            var session = _mapper.Map<ScoreSession>(viewModel);
            session = await _scoreSessionService.Create(session);
            var result = _mapper.Map<ScoreSessionViewModel>(session);
            return new OkObjectResult(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Failed to create score session");
            return StatusCode(500, new { error = "An error occurred while creating the session" });
        }
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSession([FromBody] ScoreSessionViewModel updateViewModel)
    {
        if (updateViewModel is not {Id: not null})
        {
            return new BadRequestResult();
        }

        var session = _mapper.Map<ScoreSession>(updateViewModel);
        try
        {
            var result = await _scoreSessionService.Update(session);
            var viewModel = _mapper.Map<ScoreSessionViewModel>(result);
            return new OkObjectResult(viewModel);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Failed to update score session with id {SessionId}", updateViewModel.Id);
            return StatusCode(500, new { error = "An error occurred while updating the session" });
        }
    }

    [HttpDelete]
    [Route("{id:int}")]
    public async Task<IActionResult> DeleteSession(int id)
    {
        try
        {
            await _scoreSessionService.Delete(id);
            return new OkResult();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Failed to delete score session with id {SessionId}", id);
            return StatusCode(500, new { error = "An error occurred while deleting the session" });
        }
    }

    [HttpPost]
    [Route("{id:int}/complete")]
    public async Task<IActionResult> CompleteSession(int id)
    {
        try
        {
            var session = await _scoreSessionService.CompleteSession(id);
            var result = _mapper.Map<ScoreSessionViewModel>(session);
            return new OkObjectResult(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Failed to complete score session with id {SessionId}", id);
            return StatusCode(500, new { error = "An error occurred while completing the session" });
        }
    }

    [HttpGet]
    [Route("by-game/{gameId:int}")]
    public async Task<IActionResult> GetSessionsByGame(int gameId)
    {
        try
        {
            var sessions = await _scoreSessionService.GetSessionsByGame(gameId);
            var result = _mapper.Map<IEnumerable<ScoreSessionViewModel>>(sessions);
            return new OkObjectResult(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Failed to retrieve score sessions for game {GameId}", gameId);
            return StatusCode(500, new { error = "An error occurred while retrieving sessions for the game" });
        }
    }

    [HttpGet]
    [Route("by-user/{userId}")]
    public async Task<IActionResult> GetSessionsByUser(string userId)
    {
        try
        {
            var sessions = await _scoreSessionService.GetSessionsByUser(userId);
            var result = _mapper.Map<IEnumerable<ScoreSessionViewModel>>(sessions);
            return new OkObjectResult(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Failed to retrieve score sessions for user {UserId}", userId);
            return StatusCode(500, new { error = "An error occurred while retrieving sessions for the user" });
        }
    }
}