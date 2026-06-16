using System;
using System.Threading.Tasks;

namespace CulversQRCodeScanner.Services
{
    public sealed class MockRedemptionService
    {
        private static readonly Random _random = new();

        public Task<RedemptionResponse> RedeemAsync(string qrCode)
        {
            var isValid = _random.NextDouble() > 0.25;
            var alreadyBurned = isValid && _random.NextDouble() > 0.65;

            var message = isValid
                ? alreadyBurned
                    ? "This redemption has already been burned."
                    : "Redemption approved and burned successfully."
                : "The QR code is not valid or has expired.";

            if (alreadyBurned)
            {
                isValid = false;
            }

            var response = new RedemptionResponse(
                qrCode,
                isValid,
                message,
                DateTimeOffset.Now);

            return Task.FromResult(response);
        }
    }
}
