namespace FlexCard.API.Models;

public class MintRecord
{
    public Guid Id { get; set; }
    public string ToAddress { get; set; } = "";
    public string TokenURI { get; set; } = "";
    public string TemplateId { get; set; } = "";
    public string TxHash { get; set; } = "";
    public string TokenId { get; set; } = "";
    public string? PricePaid { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PinResponse
{
    public string Cid { get; set; } = "";
    public string TokenURI { get; set; } = "";
}

public class MintResponse
{
    public string TxHash { get; set; } = "";
    public string TokenId { get; set; } = "";
}

public class RelayResponse
{
    public string TxHash { get; set; } = "";
}