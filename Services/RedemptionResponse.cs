namespace CulversQRCodeScanner.Services
{
    public sealed record RedemptionResponse(string QRCode, bool IsValid, string Message, DateTimeOffset ProcessedAt);
}
