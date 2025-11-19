using FlexCard.API.Models;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using System.Numerics;
using Nethereum.ABI.FunctionEncoding;

namespace FlexCard.API.Services;

public interface IBlockchainService
{
    Task<MintResponse> MintNFT(MintRequest request);
}

public class BlockchainService : IBlockchainService
{
    private readonly IConfiguration _configuration;
    private readonly Web3 _web3;
    private readonly Contract _contract;

    public BlockchainService(IConfiguration configuration)
    {
        _configuration = configuration;
        
        var rpcUrl = _configuration["BASE_RPC"] ?? "https://mainnet.base.org";
        var privateKey = _configuration["RELAYER_PRIVATE_KEY"];
        var contractAddress = _configuration["CONTRACT_ADDRESS"];

        if (string.IsNullOrEmpty(privateKey))
            throw new InvalidOperationException("RELAYER_PRIVATE_KEY not configured - use dedicated relayer key, NOT owner key");
        
        if (string.IsNullOrEmpty(contractAddress))
            throw new InvalidOperationException("CONTRACT_ADDRESS not configured");

        var account = new Account(privateKey);
        _web3 = new Web3(account, rpcUrl);
        
        // FlexCard contract ABI (minimal)
        var abi = @"[
            {
                ""inputs"": [
                    {""internalType"": ""address"", ""name"": ""to"", ""type"": ""address""},
                    {""internalType"": ""string"", ""name"": ""tokenURI"", ""type"": ""string""}
                ],
                ""name"": ""mintTo"",
                ""outputs"": [
                    {""internalType"": ""uint256"", ""name"": """", ""type"": ""uint256""}
                ],
                ""stateMutability"": ""nonpayable"",
                ""type"": ""function""
            },
            {
                ""anonymous"": false,
                ""inputs"": [
                    {""indexed"": true, ""internalType"": ""uint256"", ""name"": ""tokenId"", ""type"": ""uint256""},
                    {""indexed"": true, ""internalType"": ""address"", ""name"": ""to"", ""type"": ""address""},
                    {""indexed"": false, ""internalType"": ""string"", ""name"": ""tokenURI"", ""type"": ""string""}
                ],
                ""name"": ""FlexCardMinted"",
                ""type"": ""event""
            }
        ]";

        _contract = _web3.Eth.GetContract(abi, contractAddress);
    }

    public async Task<MintResponse> MintNFT(MintRequest request)
    {
        try
        {
            var mintFunction = _contract.GetFunction("mintTo");
            
            
            HexBigInteger gasEstimate;
            try
            {
                gasEstimate = await mintFunction.EstimateGasAsync(
                    _web3.TransactionManager.Account.Address,
                    null,
                    new HexBigInteger(0),
                    request.To, 
                    request.TokenURI
                );
            }
            catch (SmartContractRevertException ex) when (ex.Message.Contains("Not authorized to mint"))
            {
                var relayerAddress = _web3.TransactionManager.Account.Address;
                throw new Exception($"Relayer wallet ({relayerAddress}) needs minter role. Contract owner must call addMinter() - see deployment guide.");
            }
           
            
            // Send transaction
            var txHash = await mintFunction.SendTransactionAsync(
                _web3.TransactionManager.Account.Address,
                gasEstimate,
                new HexBigInteger(0), // value
                request.To,
                request.TokenURI
            );
            
            // Wait for receipt with timeout
            var txReceipt = await WaitForTransactionReceipt(txHash);
            if (txReceipt == null)
                throw new Exception("Transaction receipt not found");

            // Extract token ID from events
            var tokenId = ExtractTokenIdFromReceipt(txReceipt);

            return new MintResponse
            {
                TxHash = txReceipt.TransactionHash,
                TokenId = tokenId.ToString()
            };
        }
        catch (Exception ex)
        {
            if (ex.Message.Contains("Not authorized to mint"))
            {
                var relayerAddress = _web3.TransactionManager.Account.Address;
                throw new Exception($"Relayer wallet ({relayerAddress}) needs minter role. Contract owner must call addMinter() - see deployment guide.");
            }
            throw new Exception($"Failed to mint NFT: {ex.Message}");
        }
    }

    private async Task<Nethereum.RPC.Eth.DTOs.TransactionReceipt?> WaitForTransactionReceipt(string txHash)
    {
        var maxAttempts = 30;
        var attempt = 0;
        
        while (attempt < maxAttempts)
        {
            var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
            if (receipt != null)
                return receipt;
                
            await Task.Delay(2000); // Wait 2 seconds
            attempt++;
        }
        
        return null;
    }

    private BigInteger ExtractTokenIdFromReceipt(Nethereum.RPC.Eth.DTOs.TransactionReceipt receipt)
    {
        try
        {
            // Look for FlexCardMinted event
            var mintedEvent = _contract.GetEvent("FlexCardMinted");
            var logs = mintedEvent.DecodeAllEventsForEvent<FlexCardMintedEvent>(receipt.Logs);
            
            if (logs.Any())
            {
                var eventData = logs.First().Event;
                return eventData.TokenId;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to extract token ID from receipt: {ex.Message}");
        }
        
        // Fallback: parse from transaction logs manually
        foreach (var log in receipt.Logs)
        {
            if (log.Topics?.Length >= 2)
            {
                try
                {
                    var tokenIdHex = log.Topics[1]?.ToString() ?? "";
                    // Remove 0x prefix and convert hex to BigInteger
                    var hexValue = tokenIdHex.StartsWith("0x") ? tokenIdHex.Substring(2) : tokenIdHex;
                    return BigInteger.Parse(hexValue, System.Globalization.NumberStyles.HexNumber);
                }
                catch { }
            }
        }
        
        throw new Exception("Could not extract token ID from transaction receipt");
    }
}

[Nethereum.ABI.FunctionEncoding.Attributes.Event("FlexCardMinted")]
public class FlexCardMintedEvent : Nethereum.ABI.FunctionEncoding.Attributes.IEventDTO
{
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("uint256", "tokenId", 1, true)]
    public virtual BigInteger TokenId { get; set; }
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("address", "to", 2, true)]
    public virtual string To { get; set; } = "";
    
    [Nethereum.ABI.FunctionEncoding.Attributes.Parameter("string", "tokenURI", 3, false)]
    public virtual string TokenURI { get; set; } = "";
}