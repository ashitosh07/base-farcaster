using FlexCard.API.Models;
using System.Text;
using System.Text.Json;

namespace FlexCard.API.Services;

public interface IPinataService
{
    Task<PinResponse> PinToIPFS(string imageData, object metadata);
}

public class PinataService : IPinataService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public PinataService(IConfiguration configuration)
    {
        _configuration = configuration;
        _httpClient = new HttpClient();
        
        var apiKey = _configuration["PINATA_KEY"];
        var apiSecret = _configuration["PINATA_SECRET"];
        
        if (!string.IsNullOrEmpty(apiKey) && !string.IsNullOrEmpty(apiSecret))
        {
            _httpClient.DefaultRequestHeaders.Add("pinata_api_key", apiKey);
            _httpClient.DefaultRequestHeaders.Add("pinata_secret_api_key", apiSecret);
        }
        else
        {
            throw new InvalidOperationException("Pinata API credentials not configured");
        }
    }

    public async Task<PinResponse> PinToIPFS(string imageData, object metadata)
    {
        try
        {
            // Use Pinata (nft.storage API has changed to preserve.nft.storage)
            return await PinToPinata(imageData, metadata);
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to pin to IPFS: {ex.Message}");
        }
    }

    private async Task<PinResponse> PinToNFTStorage(string imageData, object metadata, string apiKey)
    {
        // nft.storage now uses preserve.nft.storage API - fallback to Pinata for simplicity
        throw new NotImplementedException("nft.storage API has changed to preserve.nft.storage. Using Pinata instead.");
    }

    private async Task<PinResponse> PinToPinata(string imageData, object metadata)
    {
        try
        {
            // Convert base64 image to bytes
            var imageBytes = Convert.FromBase64String(imageData.Split(',')[1]);
            
            // Upload image to Pinata
            using var imageContent = new MultipartFormDataContent();
            using var imageByteContent = new ByteArrayContent(imageBytes);
            imageByteContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
            imageContent.Add(imageByteContent, "file", "flexcard.png");
            
            var imageResponse = await _httpClient.PostAsync("https://api.pinata.cloud/pinning/pinFileToIPFS", imageContent);
            imageResponse.EnsureSuccessStatusCode();
            
            var imageResult = await imageResponse.Content.ReadAsStringAsync();
            var imageJson = JsonDocument.Parse(imageResult);
            var imageCid = imageJson.RootElement.GetProperty("IpfsHash").GetString();

            // Create metadata with image reference
            var metadataObj = JsonSerializer.Deserialize<Dictionary<string, object>>(JsonSerializer.Serialize(metadata));
            metadataObj!["image"] = $"ipfs://{imageCid}";

            // Upload metadata to Pinata
            var metadataJson = JsonSerializer.Serialize(metadataObj);
            using var metadataContent = new MultipartFormDataContent();
            using var metadataByteContent = new ByteArrayContent(Encoding.UTF8.GetBytes(metadataJson));
            metadataByteContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/json");
            metadataContent.Add(metadataByteContent, "file", "metadata.json");
            
            var metadataResponse = await _httpClient.PostAsync("https://api.pinata.cloud/pinning/pinFileToIPFS", metadataContent);
            metadataResponse.EnsureSuccessStatusCode();
            
            var metadataResult = await metadataResponse.Content.ReadAsStringAsync();
            var metadataJsonDoc = JsonDocument.Parse(metadataResult);
            var metadataCid = metadataJsonDoc.RootElement.GetProperty("IpfsHash").GetString();

            return new PinResponse
            {
                Cid = metadataCid!,
                TokenURI = $"ipfs://{metadataCid}"
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Failed to pin to Pinata: {ex.Message}");
        }
    }
}