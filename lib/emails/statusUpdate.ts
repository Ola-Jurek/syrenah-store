type StatusUpdateProps = {
  orderId: string;
  customerName?: string;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED";
  trackingUrl?: string;
  trackingNumber?: string;
  shippingMethod?: string;
};

function formatOrderId(orderId: string): string {
  return `#${orderId.slice(0, 8).toUpperCase()}`;
}

const STATUS_CONFIG = {
  PROCESSING: {
    titlePl: "Zamówienie przyjęte do realizacji",
    iconEmoji: "✨",
    messagePl:
      "Twoje zamówienie zostało przyjęte i jest teraz przygotowywane z najwyższą starannością. Dbamy o to, aby każdy detal był perfekcyjny.",
    ctaTextPl: "Sprawdź status zamówienia",
    accentColor: "#C1A88C",
  },
  SHIPPED: {
    titlePl: "Twoje zamówienie jest w drodze",
    iconEmoji: "📦",
    messagePl:
      "Wspaniała wiadomość! Twoje zamówienie zostało wysłane i jest już w drodze do Ciebie.",
    ctaTextPl: "Śledź przesyłkę",
    accentColor: "#C1A88C",
  },
  DELIVERED: {
    titlePl: "Zamówienie dostarczone",
    iconEmoji: "🤍",
    messagePl:
      "Twoje zamówienie zostało dostarczone. Mamy nadzieję, że sprawi Ci radość i poczujesz się w nim wyjątkowo.",
    ctaTextPl: "Zobacz swoje zamówienie",
    accentColor: "#C1A88C",
  },
};

export function statusUpdateEmail({
  orderId,
  customerName,
  status,
  trackingUrl,
  trackingNumber,
  shippingMethod,
}: StatusUpdateProps): { subject: string; html: string } {
  const config = STATUS_CONFIG[status];
  const shortOrderId = formatOrderId(orderId);
  const greeting = customerName ? `Droga ${customerName}` : "Droga Klientko";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://syrenah.com";
  const orderUrl = trackingUrl || `${appUrl}/orders/${orderId}`;

  const shippingInfo =
    status === "SHIPPED" && (trackingNumber || shippingMethod)
      ? `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
        <tr>
          <td style="padding: 20px; background-color: #FAF8F5; border: 1px solid #E8E3D8;">
            <p style="margin: 0 0 8px 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 13px; color: #8B7D6B; text-transform: uppercase; letter-spacing: 2px;">
              Informacje o przesyłce
            </p>
            ${
              shippingMethod
                ? `<p style="margin: 4px 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 14px; color: #2C2C2C;">
                <strong>Metoda wysyłki:</strong> ${shippingMethod}
              </p>`
                : ""
            }
            ${
              trackingNumber
                ? `<p style="margin: 4px 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 14px; color: #2C2C2C;">
                <strong>Numer przesyłki:</strong> ${trackingNumber}
              </p>`
                : ""
            }
          </td>
        </tr>
      </table>`
      : "";

  const subject = `${config.titlePl} ${shortOrderId} — Syrenah`;

  const html = `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.titlePl}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: 'Georgia', 'Times New Roman', serif;">
  
  <!-- Outer wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8F5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <!-- Main container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #E8E3D8;">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px; border-bottom: 1px solid #E8E3D8;">
              <img src="${appUrl}/SYRENAH_logo_napis.png" alt="Syrenah" width="160" style="display: block; max-width: 160px; height: auto;" />
            </td>
          </tr>

          <!-- Status Icon -->
          <tr>
            <td align="center" style="padding: 40px 40px 16px 40px;">
              <span style="font-size: 36px; line-height: 1;">${config.iconEmoji}</span>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="center" style="padding: 0 40px 8px 40px;">
              <h1 style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: 400; color: #2C2C2C; letter-spacing: 1px;">
                ${config.titlePl}
              </h1>
            </td>
          </tr>

          <!-- Order Number -->
          <tr>
            <td align="center" style="padding: 0 40px 24px 40px;">
              <p style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 13px; color: #8B7D6B; letter-spacing: 2px; text-transform: uppercase;">
                Zamówienie ${shortOrderId}
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 0 60px;">
              <div style="height: 1px; background-color: #E8E3D8; width: 60px;"></div>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 28px 50px 16px 50px;">
              <p style="margin: 0 0 16px 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 15px; line-height: 1.7; color: #4A4A4A; text-align: center;">
                ${greeting},
              </p>
              <p style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 15px; line-height: 1.7; color: #4A4A4A; text-align: center;">
                ${config.messagePl}
              </p>
            </td>
          </tr>

          <!-- Shipping Info (only for SHIPPED) -->
          <tr>
            <td style="padding: 0 50px;">
              ${shippingInfo}
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 24px 50px 40px 50px;">
              <a href="${orderUrl}" style="display: inline-block; padding: 14px 36px; background-color: #C1A88C; color: #FFFFFF; text-decoration: none; font-family: 'Georgia', 'Times New Roman', serif; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border: none;">
                ${config.ctaTextPl}
              </a>
            </td>
          </tr>

          <!-- Footer divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #E8E3D8;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 30px 40px 40px 40px;">
              <p style="margin: 0 0 8px 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 14px; color: #C1A88C; font-style: italic;">
                Z miłością,
              </p>
              <p style="margin: 0 0 16px 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 16px; color: #2C2C2C; letter-spacing: 2px;">
                SYRENAH
              </p>
              <p style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 11px; color: #B0A89E; letter-spacing: 1px;">
                <a href="${appUrl}" style="color: #B0A89E; text-decoration: none;">syrenah.com</a>
              </p>
            </td>
          </tr>

        </table>

        <!-- Unsubscribe note -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td align="center" style="padding: 24px 20px;">
              <p style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 11px; color: #B0A89E; line-height: 1.6;">
                Ta wiadomość została wysłana automatycznie w związku z Twoim zamówieniem w Syrenah Store.
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;

  return { subject, html };
}
