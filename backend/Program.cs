using Microsoft.EntityFrameworkCore;
using FlexCard.API.Data;
using FlexCard.API.Services;
using FlexCard.API.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "FlexCard API",
        Version = "v1",
        Description = "API for FlexCard NFT minting platform on Base",
        Contact = new Microsoft.OpenApi.Models.OpenApiContact
        {
            Name = "FlexCard Team",
            Email = "support@flexcard.app"
        }
    });
    
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
});

// CORS - Secure configuration
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins(
                    "http://localhost:5173", // Vite dev server
                    "https://flexcard.vercel.app", // Production frontend
                    "https://base-farcaster.vercel.app", // Production frontend
                    "https://base-farcaster-git-main-ashitosh07s-projects.vercel.app" // Git branch deployments
                  )
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=flexcard.db";

builder.Services.AddDbContext<FlexCardContext>(options =>
{
    if (connectionString.Contains("postgresql"))
        options.UseNpgsql(connectionString);
    else
        options.UseSqlite(connectionString);
});

// Services
builder.Services.AddScoped<IPinataService, PinataService>();
builder.Services.AddScoped<IBlockchainService, BlockchainService>();
builder.Services.AddScoped<IRelayerService, RelayerService>();
builder.Services.AddScoped<IStatsService, StatsService>();
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FlexCard API v1");
    c.RoutePrefix = string.Empty; // Serve at root
    c.DocumentTitle = "FlexCard API Documentation";
});

// Also serve at /swagger for convenience
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FlexCard API v1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "FlexCard API Documentation";
});

app.UseCors();

// Ensure database is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FlexCardContext>();
    context.Database.EnsureCreated();
}

// API Endpoints
app.MapPost("/api/pin", async (PinRequest request, IPinataService pinataService) =>
{
    try
    {
        var result = await pinataService.PinToIPFS(request.Image, request.Metadata);
        return Results.Ok(new ApiResponse<PinResponse>
        {
            Success = true,
            Data = result
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new ApiResponse<object>
        {
            Success = false,
            Error = new ApiError { Code = "PIN_FAILED", Message = ex.Message }
        });
    }
})
.WithName("PinToIPFS")
.WithSummary("Pin image and metadata to IPFS")
.WithDescription("Uploads image data and metadata to IPFS storage (nft.storage or Pinata)")
.WithTags("IPFS");

app.MapPost("/api/mint", async (MintRequest request, IBlockchainService blockchainService, FlexCardContext context) =>
{
    try
    {
        var result = await blockchainService.MintNFT(request);
        
        // Save mint record
        var mintRecord = new MintRecord
        {
            Id = Guid.NewGuid(),
            ToAddress = request.To,
            TokenURI = request.TokenURI,
            TemplateId = request.TemplateId,
            TxHash = result.TxHash,
            TokenId = result.TokenId,
            PricePaid = request.PricePaid,
            CreatedAt = DateTime.UtcNow
        };
        
        context.MintRecords.Add(mintRecord);
        await context.SaveChangesAsync();
        
        return Results.Ok(new ApiResponse<MintResponse>
        {
            Success = true,
            Data = result
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new ApiResponse<object>
        {
            Success = false,
            Error = new ApiError { Code = "MINT_FAILED", Message = ex.Message }
        });
    }
})
.WithName("MintNFT")
.WithSummary("Mint FlexCard NFT")
.WithDescription("Mints a new FlexCard NFT on Base blockchain")
.WithTags("NFT");

app.MapPost("/api/relay/submit", async (RelayRequest request, IRelayerService relayerService) =>
{
    try
    {
        var result = await relayerService.SubmitMetaTransaction(request);
        return Results.Ok(new ApiResponse<RelayResponse>
        {
            Success = true,
            Data = result
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new ApiResponse<object>
        {
            Success = false,
            Error = new ApiError { Code = "RELAY_FAILED", Message = ex.Message }
        });
    }
})
.WithName("SubmitMetaTransaction")
.WithSummary("Submit meta-transaction")
.WithDescription("Submits a gasless meta-transaction for NFT minting")
.WithTags("Meta-Transactions");

// Add new endpoints for frontend integration
app.MapGet("/api/stats", async (IStatsService statsService) =>
{
    try
    {
        var stats = await statsService.GetPlatformStats();
        return Results.Ok(new ApiResponse<object>
        {
            Success = true,
            Data = stats
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new ApiResponse<object>
        {
            Success = false,
            Error = new ApiError { Code = "STATS_FAILED", Message = ex.Message }
        });
    }
})
.WithName("GetStats")
.WithSummary("Get platform statistics")
.WithTags("Stats");

app.MapGet("/api/templates", () =>
{
    var templates = new[]
    {
        new { id = "basic", name = "Basic Free", description = "Clean and simple FlexCard design", price = 0.0, animated = false, premium = false, features = new[] { "High quality PNG export", "Custom colors", "Farcaster stats" }, preview = "/templates/basic-preview.png" },
        new { id = "premium", name = "Premium Static", description = "Premium design with glass effects and glow", price = 0.001, animated = false, premium = true, features = new[] { "Glass morphism effects", "Gradient borders", "Premium badge" }, preview = "/templates/premium-preview.png" },
        new { id = "animated", name = "Premium Animated", description = "Animated FlexCard with motion effects", price = 0.002, animated = true, premium = true, features = new[] { "Animated GIF export", "Particle effects", "Floating animations" }, preview = "/templates/animated-preview.gif" }
    };
    
    return Results.Ok(new ApiResponse<object>
    {
        Success = true,
        Data = templates
    });
})
.WithName("GetTemplates")
.WithSummary("Get available templates")
.WithTags("Templates");

app.MapPost("/api/upload-temp-image", async (TempImageRequest request, IPinataService pinataService) =>
{
    try
    {
        // Upload image to Pinata for temporary sharing
        var imageBytes = Convert.FromBase64String(request.Image.Split(',')[1]);
        var fileName = $"flexcard-share-{Guid.NewGuid()}.png";
        
        using var stream = new MemoryStream(imageBytes);
        var result = await pinataService.UploadFile(stream, fileName);
        
        return Results.Ok(new ApiResponse<object>
        {
            Success = true,
            Data = new { imageUrl = $"https://gateway.pinata.cloud/ipfs/{result.IpfsHash}" }
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new ApiResponse<object>
        {
            Success = false,
            Error = new ApiError { Code = "UPLOAD_FAILED", Message = ex.Message }
        });
    }
})
.WithName("UploadTempImage")
.WithSummary("Upload temporary image for sharing")
.WithTags("Sharing");

app.MapGet("/api/admin/mints", async (FlexCardContext context, HttpContext httpContext) =>
{
    var apiKey = httpContext.Request.Headers["Authorization"].FirstOrDefault()?.Replace("Bearer ", "");
    var expectedKey = builder.Configuration["API_KEY_ADMIN"];
    
    if (string.IsNullOrEmpty(apiKey) || apiKey != expectedKey)
    {
        return Results.Unauthorized();
    }
    
    var mints = await context.MintRecords
        .OrderByDescending(m => m.CreatedAt)
        .Take(100)
        .ToListAsync();
    
    var stats = new
    {
        TotalMints = await context.MintRecords.CountAsync(),
        TotalRevenue = await context.MintRecords.SumAsync(m => decimal.Parse(m.PricePaid ?? "0")),
        RecentMints = mints
    };
    
    return Results.Ok(new ApiResponse<object>
    {
        Success = true,
        Data = stats
    });
})
.WithName("GetMintStats")
.WithSummary("Get mint statistics")
.WithDescription("Retrieves minting statistics and recent mint records (Admin only)")
.WithTags("Admin");

app.Run();

// Models for API
public record PinRequest(string Image, object Metadata);
public record MintRequest(string To, string TokenURI, string TemplateId, string? PricePaid = null, object? PaymentProof = null);
public record RelayRequest(string Signature, object Message);
public record TempImageRequest(string Image);

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public ApiError? Error { get; set; }
}

public class ApiError
{
    public string Code { get; set; } = "";
    public string Message { get; set; } = "";
}