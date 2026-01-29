using System;
using System.Threading.Tasks;
using BoardGameTracker.Common.Entities;
using BoardGameTracker.Core.Datastore.Interfaces;
using BoardGameTracker.Core.ScoreSheets;
using FluentAssertions;
using Moq;
using Xunit;

namespace BoardGameTracker.Tests.ScoreSheets;

public class ScoreSheetTemplateServiceTests
{
    private readonly Mock<IScoreSheetTemplateRepository> _mockRepository;
    private readonly ScoreSheetTemplateService _service;

    public ScoreSheetTemplateServiceTests()
    {
        _mockRepository = new Mock<IScoreSheetTemplateRepository>();
        _service = new ScoreSheetTemplateService(_mockRepository.Object);
    }

    [Fact]
    public async Task Create_Should_Throw_ArgumentNullException_When_Template_Is_Null()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _service.Create(null!));
    }

    [Fact]
    public async Task Create_Should_Throw_ArgumentException_When_Name_Is_Empty()
    {
        // Arrange
        var template = new ScoreSheetTemplate
        {
            Name = "",
            JsonDefinition = "{}",
            MinPlayers = 1,
            MaxPlayers = 4
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.Create(template));
        exception.Message.Should().Contain("name");
    }

    [Fact]
    public async Task Create_Should_Throw_ArgumentException_When_JsonDefinition_Is_Empty()
    {
        // Arrange
        var template = new ScoreSheetTemplate
        {
            Name = "Test Template",
            JsonDefinition = "",
            MinPlayers = 1,
            MaxPlayers = 4
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.Create(template));
        exception.Message.Should().Contain("JSON definition");
    }

    [Fact]
    public async Task Create_Should_Throw_ArgumentException_When_MinPlayers_Is_Less_Than_One()
    {
        // Arrange
        var template = new ScoreSheetTemplate
        {
            Name = "Test Template",
            JsonDefinition = "{}",
            MinPlayers = 0,
            MaxPlayers = 4
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.Create(template));
        exception.Message.Should().Contain("MinPlayers");
    }

    [Fact]
    public async Task Create_Should_Throw_ArgumentException_When_MaxPlayers_Is_Less_Than_MinPlayers()
    {
        // Arrange
        var template = new ScoreSheetTemplate
        {
            Name = "Test Template",
            JsonDefinition = "{}",
            MinPlayers = 5,
            MaxPlayers = 2
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.Create(template));
        exception.Message.Should().Contain("MaxPlayers");
    }

    [Fact]
    public async Task Create_Should_Set_CreatedAt_And_UpdatedAt()
    {
        // Arrange
        var template = new ScoreSheetTemplate
        {
            Name = "Test Template",
            JsonDefinition = "{}",
            MinPlayers = 1,
            MaxPlayers = 4
        };

        _mockRepository.Setup(r => r.CreateAsync(It.IsAny<ScoreSheetTemplate>()))
            .ReturnsAsync((ScoreSheetTemplate t) => t);

        var beforeCreate = DateTime.UtcNow;

        // Act
        var result = await _service.Create(template);

        // Assert
        result.CreatedAt.Should().BeOnOrAfter(beforeCreate);
        result.UpdatedAt.Should().BeOnOrAfter(beforeCreate);
    }

    [Fact]
    public async Task Create_Should_Call_Repository_CreateAsync()
    {
        // Arrange
        var template = new ScoreSheetTemplate
        {
            Name = "Test Template",
            JsonDefinition = "{}",
            MinPlayers = 1,
            MaxPlayers = 4
        };

        _mockRepository.Setup(r => r.CreateAsync(It.IsAny<ScoreSheetTemplate>()))
            .ReturnsAsync(template);

        // Act
        await _service.Create(template);

        // Assert
        _mockRepository.Verify(r => r.CreateAsync(template), Times.Once);
    }

    [Fact]
    public async Task Update_Should_Throw_ArgumentNullException_When_Template_Is_Null()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _service.Update(null!));
    }

    [Fact]
    public async Task Update_Should_Throw_ArgumentException_When_Id_Is_Zero()
    {
        // Arrange
        var template = new ScoreSheetTemplate
        {
            Id = 0,
            Name = "Test Template",
            JsonDefinition = "{}",
            MinPlayers = 1,
            MaxPlayers = 4
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.Update(template));
        exception.Message.Should().Contain("Id");
    }

    [Fact]
    public async Task Update_Should_Set_UpdatedAt()
    {
        // Arrange
        var template = new ScoreSheetTemplate
        {
            Id = 1,
            Name = "Test Template",
            JsonDefinition = "{}",
            MinPlayers = 1,
            MaxPlayers = 4
        };

        _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<ScoreSheetTemplate>()))
            .ReturnsAsync((ScoreSheetTemplate t) => t);

        var beforeUpdate = DateTime.UtcNow;

        // Act
        var result = await _service.Update(template);

        // Assert
        result.UpdatedAt.Should().BeOnOrAfter(beforeUpdate);
    }
}
