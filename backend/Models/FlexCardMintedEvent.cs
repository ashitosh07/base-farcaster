using Nethereum.ABI.FunctionEncoding.Attributes;
using System.Numerics;

[Event("FlexCardMinted")]
public class FlexCardMintedEvent : IEventDTO
{
    [Parameter("address", "to", 1, true)]
    public string To { get; set; }

    [Parameter("uint256", "tokenId", 2, true)]
    public BigInteger TokenId { get; set; }

    [Parameter("string", "templateId", 3, false)]
    public string TemplateId { get; set; }

    [Parameter("string", "tokenURI", 4, false)]
    public string TokenURI { get; set; }
}
