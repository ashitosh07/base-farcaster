using FlexCard.API.Data;
using Microsoft.EntityFrameworkCore;

namespace FlexCard.API.Services;

public interface IStatsService
{
    Task<object> GetPlatformStats();
}

public class StatsService : IStatsService
{
    private readonly FlexCardContext _context;

    public StatsService(FlexCardContext context)
    {
        _context = context;
    }

    public async Task<object> GetPlatformStats()
    {
        var totalMints = await _context.MintRecords.CountAsync();
        
        var activeUsers = await _context.MintRecords
            .Where(m => m.CreatedAt >= DateTime.UtcNow.AddDays(-30))
            .Select(m => m.ToAddress)
            .Distinct()
            .CountAsync();

        var recentMints = await _context.MintRecords
            .Where(m => m.CreatedAt >= DateTime.UtcNow.AddDays(-7))
            .CountAsync();

        var previousWeekMints = await _context.MintRecords
            .Where(m => m.CreatedAt >= DateTime.UtcNow.AddDays(-14) && m.CreatedAt < DateTime.UtcNow.AddDays(-7))
            .CountAsync();

        var mintGrowth = previousWeekMints > 0 
            ? Math.Round(((double)(recentMints - previousWeekMints) / previousWeekMints) * 100, 1)
            : 0;

        return new
        {
            TotalMints = totalMints,
            ActiveUsers = activeUsers,
            Templates = 3,
            MintGrowth = mintGrowth
        };
    }
}