using AutoMapper;
using BoardGameTracker.Common.Entities;
using BoardGameTracker.Common.ViewModels;
using BoardGameTracker.Core.ScoreSheets.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BoardGameTracker.Api.Controllers;

[ApiController]
[Route("api/score-sheet-template")]
public class ScoreSheetTemplateController : ControllerBase
{
    private readonly IScoreSheetTemplateService _scoreSheetTemplateService;
    private readonly IMapper _mapper;
    private readonly ILogger<ScoreSheetTemplateController> _logger;

    public ScoreSheetTemplateController(
        IScoreSheetTemplateService scoreSheetTemplateService,
        IMapper mapper,
        ILogger<ScoreSheetTemplateController> logger)
    {
        _scoreSheetTemplateService = scoreSheetTemplateService;
        _mapper = mapper;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTemplates()
    {
        try
        {
            var templates = await _scoreSheetTemplateService.GetAllTemplates();
            var result = _mapper.Map<IEnumerable<ScoreSheetTemplateViewModel>>(templates);
            return new OkObjectResult(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return StatusCode(500);
        }
    }

    [HttpGet]
    [Route("{id:int}")]
    public async Task<IActionResult> GetTemplateById(int id)
    {
        try
        {
            var template = await _scoreSheetTemplateService.GetTemplateById(id);
            if (template == null)
            {
                return new NotFoundResult();
            }
            var result = _mapper.Map<ScoreSheetTemplateViewModel>(template);
            return new OkObjectResult(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return StatusCode(500);
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateTemplate([FromBody] ScoreSheetTemplateViewModel viewModel)
    {
        if (viewModel == null)
        {
            return new BadRequestResult();
        }

        try
        {
            var template = _mapper.Map<ScoreSheetTemplate>(viewModel);
            template = await _scoreSheetTemplateService.Create(template);
            var result = _mapper.Map<ScoreSheetTemplateViewModel>(template);
            return new OkObjectResult(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return StatusCode(500);
        }
    }

    [HttpPut]
    public async Task<IActionResult> UpdateTemplate([FromBody] ScoreSheetTemplateViewModel updateViewModel)
    {
        if (updateViewModel is not {Id: not null})
        {
            return new BadRequestResult();
        }

        var template = _mapper.Map<ScoreSheetTemplate>(updateViewModel);
        try
        {
            var result = await _scoreSheetTemplateService.Update(template);
            var viewModel = _mapper.Map<ScoreSheetTemplateViewModel>(result);
            return new OkObjectResult(viewModel);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return StatusCode(500);
        }
    }

    [HttpDelete]
    [Route("{id:int}")]
    public async Task<IActionResult> DeleteTemplate(int id)
    {
        try
        {
            await _scoreSheetTemplateService.Delete(id);
            return new OkResult();
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return StatusCode(500);
        }
    }

    [HttpGet]
    [Route("by-game/{gameId:int}")]
    public async Task<IActionResult> GetTemplatesByGame(int gameId)
    {
        try
        {
            var templates = await _scoreSheetTemplateService.GetTemplatesByGame(gameId);
            var result = _mapper.Map<IEnumerable<ScoreSheetTemplateViewModel>>(templates);
            return new OkObjectResult(result);
        }
        catch (Exception e)
        {
            _logger.LogError(e.Message);
            return StatusCode(500);
        }
    }
}