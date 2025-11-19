using FlexCard.API.Models;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Signer;
using Nethereum.Util;
using System.Text.Json;
using System.Text;
using System.Linq;

namespace FlexCard.API.Services;

public interface IRelayerService
{
    Task<RelayResponse> SubmitMetaTransaction(RelayRequest request);
}

public class RelayerService : IRelayerService
{
    private readonly IConfiguration _configuration;
    private readonly Web3 _web3;
    private readonly IBlockchainService _blockchainService;

    public RelayerService(IConfiguration configuration, IBlockchainService blockchainService)
    {
        _configuration = configuration;
        _blockchainService = blockchainService;
        
        var rpcUrl = _configuration["BASE_RPC"] ?? "https://mainnet.base.org";
        var privateKey = _configuration["RELAYER_PRIVATE_KEY"];

        if (string.IsNullOrEmpty(privateKey))
            throw new InvalidOperationException("RELAYER_PRIVATE_KEY not configured");

        var account = new Account(privateKey);
        _web3 = new Web3(account, rpcUrl);
    }

    public async Task<RelayResponse> SubmitMetaTransaction(RelayRequest request)
    {
        try
        {
            // Verify EIP-712 signature
            var isValid = await VerifySignature(request.Signature, request.Message);
            if (!isValid)
            {
                throw new UnauthorizedAccessException("Invalid signature");
            }

            // Extract mint parameters from message
            var messageJson = JsonSerializer.Serialize(request.Message);
            var mintRequest = JsonSerializer.Deserialize<MintRequestMessage>(messageJson);
            
            if (mintRequest == null)
                throw new ArgumentException("Invalid message format");

            // Check deadline
            var deadline = DateTimeOffset.FromUnixTimeSeconds((long)mintRequest.Deadline);
            if (deadline < DateTimeOffset.UtcNow)
            {
                throw new ArgumentException("Transaction deadline exceeded");
            }

            // Execute mint via blockchain service
            var mintResponse = await _blockchainService.MintNFT(new MintRequest(
                mintRequest.To,
                mintRequest.TokenURI,
                "meta-tx", // Template ID for meta transactions
                null,
                null
            ));

            return new RelayResponse
            {
                TxHash = mintResponse.TxHash
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"Meta-transaction failed: {ex.Message}");
        }
    }

    private Task<bool> VerifySignature(string signature, object message)
    {
        try
        {
            var messageJson = JsonSerializer.Serialize(message);
            var mintRequest = JsonSerializer.Deserialize<MintRequestMessage>(messageJson);
            
            if (mintRequest == null) return Task.FromResult(false);

            // Simplified signature verification for now
            // In production, implement full EIP-712 verification
            var isValidFormat = !string.IsNullOrEmpty(signature) && signature.StartsWith("0x") && signature.Length == 132;
            var hasValidDeadline = mintRequest.Deadline > (ulong)DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            
            return Task.FromResult(isValidFormat && hasValidDeadline);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Signature verification failed: {ex.Message}");
            return Task.FromResult(false);
        }
    }

    private class MintRequestMessage
    {
        public string To { get; set; } = "";
        public string TokenURI { get; set; } = "";
        public ulong Nonce { get; set; }
        public ulong Deadline { get; set; }
    }
}