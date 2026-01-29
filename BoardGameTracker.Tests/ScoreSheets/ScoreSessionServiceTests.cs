using System;
using System.Threading.Tasks;
using BoardGameTracker.Common.Entities;
using BoardGameTracker.Core.Datastore.Interfaces;
using BoardGameTracker.Core.ScoreSheets;
using FluentAssertions;
using Moq;
using Xunit;

namespace BoardGameTracker.Tests.ScoreSheets;

public class ScoreSessionServiceTests
{
    private readonly Mock<IScoreSessionRepository> _mockRepository;
    private readonly ScoreSessionService _service;

    public ScoreSessionServiceTests()
    {
        _mockRepository = new Mock<IScoreSessionRepository>();
        _service = new ScoreSessionService(_mockRepository.Object);
    }

    [Fact]
    public async Task Create_Should_Throw_ArgumentNullException_When_Session_Is_Null()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _service.Create(null!));
    }

    [Fact]
    public async Task Create_Should_Throw_ArgumentException_When_Name_Is_Empty()
    {
        // Arrange
        var session = new ScoreSession
        {
            Name = "",
            ScoreSheetTemplateId = 1
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.Create(session));
        exception.Message.Should().Contain("name");
    }

    [Fact]
    public async Task Create_Should_Throw_ArgumentException_When_ScoreSheetTemplateId_Is_Zero()
    {
        // Arrange
        var session = new ScoreSession
        {
            Name = "Test Session",
            ScoreSheetTemplateId = 0
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.Create(session));
        exception.Message.Should().Contain("ScoreSheetTemplateId");
    }

    [Fact]
    public async Task Create_Should_Set_CreatedAt_And_UpdatedAt()
    {
        // Arrange
        var session = new ScoreSession
        {
            Name = "Test Session",
            ScoreSheetTemplateId = 1
        };

        _mockRepository.Setup(r => r.CreateAsync(It.IsAny<ScoreSession>()))
            .ReturnsAsync((ScoreSession s) => s);

        var beforeCreate = DateTime.UtcNow;

        // Act
        var result = await _service.Create(session);

        // Assert
        result.CreatedAt.Should().BeOnOrAfter(beforeCreate);
        result.UpdatedAt.Should().BeOnOrAfter(beforeCreate);
    }

    [Fact]
    public async Task Create_Should_Call_Repository_CreateAsync()
    {
        // Arrange
        var session = new ScoreSession
        {
            Name = "Test Session",
            ScoreSheetTemplateId = 1
        };

        _mockRepository.Setup(r => r.CreateAsync(It.IsAny<ScoreSession>()))
            .ReturnsAsync(session);

        // Act
        await _service.Create(session);

        // Assert
        _mockRepository.Verify(r => r.CreateAsync(session), Times.Once);
    }

    [Fact]
    public async Task Update_Should_Throw_ArgumentNullException_When_Session_Is_Null()
    {
        // Act & Assert
        await Assert.ThrowsAsync<ArgumentNullException>(() => _service.Update(null!));
    }

    [Fact]
    public async Task Update_Should_Throw_ArgumentException_When_Id_Is_Zero()
    {
        // Arrange
        var session = new ScoreSession
        {
            Id = 0,
            Name = "Test Session",
            ScoreSheetTemplateId = 1
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(() => _service.Update(session));
        exception.Message.Should().Contain("Id");
    }

    [Fact]
    public async Task Update_Should_Set_UpdatedAt()
    {
        // Arrange
        var session = new ScoreSession
        {
            Id = 1,
            Name = "Test Session",
            ScoreSheetTemplateId = 1
        };

        _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<ScoreSession>()))
            .ReturnsAsync((ScoreSession s) => s);

        var beforeUpdate = DateTime.UtcNow;

        // Act
        var result = await _service.Update(session);

        // Assert
        result.UpdatedAt.Should().BeOnOrAfter(beforeUpdate);
    }

    [Fact]
    public async Task CompleteSession_Should_Throw_Exception_When_Session_Not_Found()
    {
        // Arrange
        _mockRepository.Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((ScoreSession?)null);

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _service.CompleteSession(1));
    }

    [Fact]
    public async Task CompleteSession_Should_Set_IsCompleted_And_FinishedAt()
    {
        // Arrange
        var session = new ScoreSession
        {
            Id = 1,
            Name = "Test Session",
            ScoreSheetTemplateId = 1,
            IsCompleted = false
        };

        _mockRepository.Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(session);

        _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<ScoreSession>()))
            .ReturnsAsync((ScoreSession s) => s);

        var beforeComplete = DateTime.UtcNow;

        // Act
        var result = await _service.CompleteSession(1);

        // Assert
        result.IsCompleted.Should().BeTrue();
        result.FinishedAt.Should().NotBeNull();
        result.FinishedAt.Should().BeOnOrAfter(beforeComplete);
        result.UpdatedAt.Should().BeOnOrAfter(beforeComplete);
    }
}
