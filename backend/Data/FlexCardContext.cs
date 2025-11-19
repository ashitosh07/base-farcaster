using Microsoft.EntityFrameworkCore;
using FlexCard.API.Models;

namespace FlexCard.API.Data;

public class FlexCardContext : DbContext
{
    public FlexCardContext(DbContextOptions<FlexCardContext> options) : base(options) { }

    public DbSet<MintRecord> MintRecords { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<MintRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ToAddress).IsRequired().HasMaxLength(42);
            entity.Property(e => e.TokenURI).IsRequired();
            entity.Property(e => e.TemplateId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TxHash).IsRequired().HasMaxLength(66);
            entity.Property(e => e.TokenId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PricePaid).HasMaxLength(50);
            entity.Property(e => e.CreatedAt).IsRequired();
            
            entity.HasIndex(e => e.ToAddress);
            entity.HasIndex(e => e.CreatedAt);
        });
    }
}