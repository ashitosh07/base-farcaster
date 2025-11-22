using FlexCard.API.Models;
using Nethereum.Web3;
using Nethereum.Web3.Accounts;
using Nethereum.Contracts;
using Nethereum.Hex.HexTypes;
using System.Numerics;
using Nethereum.ABI.FunctionEncoding;
using Nethereum.RPC.Eth.DTOs;

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
    private readonly Account _account;

    public BlockchainService(IConfiguration configuration)
    {
        _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));

        var rpcUrl = _configuration["BASE_RPC"];
        var privateKey = _configuration["RELAYER_PRIVATE_KEY"];
        var contractAddress = _configuration["CONTRACT_ADDRESS"];

        if (string.IsNullOrEmpty(privateKey))
            throw new InvalidOperationException("RELAYER_PRIVATE_KEY not configured - use dedicated relayer key");

        if (string.IsNullOrEmpty(contractAddress))
            throw new InvalidOperationException("CONTRACT_ADDRESS not configured");

        _account = new Account(privateKey);
        _web3 = new Web3(_account, rpcUrl);

        Console.WriteLine($"Web3 OK. Relayer = {_account.Address}");

        // 🔥 Correct ABI for FlexCardNFT
        var abi = @"[
            {
                ""inputs"": [
                    { ""internalType"": ""address"", ""name"": ""to"", ""type"": ""address"" },
                    { ""internalType"": ""string"",  ""name"": ""uri"", ""type"": ""string"" },
                    { ""internalType"": ""string"",  ""name"": ""templateId"", ""type"": ""string"" }
                ],
                ""name"": ""mintTo"",
                ""outputs"": [
                    { ""internalType"": ""uint256"", ""name"": """", ""type"": ""uint256"" }
                ],
                ""stateMutability"": ""nonpayable"",
                ""type"": ""function""
            },
            {
                ""anonymous"": false,
                ""inputs"": [
                    { ""indexed"": true,  ""internalType"": ""address"", ""name"": ""to"", ""type"": ""address"" },
                    { ""indexed"": true,  ""internalType"": ""uint256"", ""name"": ""tokenId"", ""type"": ""uint256"" },
                    { ""indexed"": false, ""internalType"": ""string"",  ""name"": ""templateId"", ""type"": ""string"" },
                    { ""indexed"": false, ""internalType"": ""string"",  ""name"": ""tokenURI"", ""type"": ""string"" }
                ],
                ""name"": ""FlexCardMinted"",
                ""type"": ""event""
            }
        ]";

        _contract = _web3.Eth.GetContract(abi, contractAddress);
    }

    public async Task<MintResponse> MintNFT(MintRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.To))
            throw new Exception("Recipient address required");

        if (string.IsNullOrWhiteSpace(request.TokenURI))
            throw new Exception("TokenURI required");

        if (_contract == null)
            throw new Exception("Contract not initialized");

        var mintFunction = _contract.GetFunction("mintTo");
        if (mintFunction == null)
            throw new Exception("mintTo function not found in ABI");

        HexBigInteger gasEstimate;

        try
        {
            gasEstimate = await mintFunction.EstimateGasAsync(
                _account.Address,
                null,
                new HexBigInteger(0),
                request.To,
                request.TokenURI,
                request.TemplateId
            );
        }
        catch (SmartContractRevertException ex)
        {
            if (ex.RevertMessage?.Contains("Not authorized") == true)
                throw new Exception($"Relayer wallet {_account.Address} does NOT have MINTER_ROLE.");

            throw;
        }

        if (gasEstimate == null || gasEstimate.Value == 0)
            throw new Exception("Gas estimation failed (likely revert)");

        // 🔥 Send transaction
        var txHash = await mintFunction.SendTransactionAsync(
            _account.Address,
            gasEstimate,
            new HexBigInteger(0),
            request.To,
            request.TokenURI,
            request.TemplateId
        );

        var receipt = await WaitForTransactionReceipt(txHash);
        if (receipt == null)
            throw new Exception("Transaction receipt was null");

        var tokenId = ExtractTokenIdFromReceipt(receipt);

        return new MintResponse
        {
            TxHash = txHash,
            TokenId = tokenId.ToString()
        };
    }

    private async Task<TransactionReceipt?> WaitForTransactionReceipt(string txHash)
    {
        for (int i = 0; i < 30; i++)
        {
            var receipt = await _web3.Eth.Transactions.GetTransactionReceipt.SendRequestAsync(txHash);
            if (receipt != null)
                return receipt;

            await Task.Delay(2000);
        }
        return null;
    }

    private BigInteger ExtractTokenIdFromReceipt(TransactionReceipt receipt)
    {
        var mintedEvent = _contract.GetEvent("FlexCardMinted");
        var decoded = mintedEvent.DecodeAllEventsForEvent<FlexCardMintedEvent>(receipt.Logs);

        if (decoded.Any())
            return decoded.First().Event.TokenId;

        // Fallback (manual)
        foreach (var log in receipt.Logs)
        {
            if (log.Topics != null && log.Topics.Length >= 3)
            {
                // Topic[2] = tokenId
                var hex = log.Topics[2].ToString().Substring(2);
                return BigInteger.Parse(hex, System.Globalization.NumberStyles.HexNumber);
            }
        }

        throw new Exception("Token ID not found in logs");
    }
}
