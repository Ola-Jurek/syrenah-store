type OrderConfirmationProps = {
  orderId: string;
  totalPln: number;
  totalEur: number;
  trackingUrl: string;
  customerName?: string;
  locale?: "pl" | "en";
};

function formatOrderId(orderId: string): string {
  return `#${orderId.slice(0, 8).toUpperCase()}`;
}

const copy = {
  pl: {
    htmlLang: "pl",
    docTitle: "Potwierdzenie zamówienia",
    title: "Dziękujemy za zamówienie",
    greetingNamed: (name: string) => `Droga ${name}`,
    greetingDefault: "Droga Klientko",
    body: "Twoje zamówienie zostało przyjęte i jest teraz przetwarzane. Wkrótce otrzymasz kolejne informacje dotyczące wysyłki.",
    detailsTitle: "Szczegóły zamówienia",
    numberLabel: "Numer:",
    amountLabel: "Kwota:",
    amountValue: (n: number) => `${n.toFixed(2)} PLN`,
    cta: "\u015Aled\u017a zam\u00f3wienie",
    signoff: "Z mi\u0142o\u015bci\u0105,",
    footerNote:
      "Ta wiadomość została wysłana automatycznie w związku z Twoim zamówieniem w Syrenah Store.",
    subject: (short: string) => `Potwierdzenie zamówienia ${short}`,
  },
  en: {
    htmlLang: "en",
    docTitle: "Order confirmation",
    title: "Thank you for your order",
    greetingNamed: (name: string) => `Dear ${name}`,
    greetingDefault: "Dear customer",
    body: "Your order has been received and is being processed. You will receive further shipping updates shortly.",
    detailsTitle: "Order details",
    numberLabel: "Number:",
    amountLabel: "Amount:",
    amountValue: (n: number) => `${n.toFixed(2)} EUR`,
    cta: "Track order",
    signoff: "With love,",
    footerNote:
      "This message was sent automatically regarding your order at Syrenah Store.",
    subject: (short: string) => `Order confirmation ${short}`,
  },
} as const;

export function orderConfirmationEmail({
  orderId,
  totalPln,
  totalEur,
  trackingUrl,
  customerName,
  locale = "pl",
}: OrderConfirmationProps) {
  const shortOrderId = formatOrderId(orderId);
  const L = locale === "en" ? copy.en : copy.pl;
  const greeting = customerName
    ? L.greetingNamed(customerName)
    : L.greetingDefault;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://syrenah.com";
  const amount =
    locale === "en" ? L.amountValue(totalEur) : L.amountValue(totalPln);

  return `
<!DOCTYPE html>
<html lang="${L.htmlLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${L.docTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: 'Georgia', 'Times New Roman', serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8F5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border: 1px solid #E8E3D8;">
          
          <tr>
            <td align="center" style="padding: 40px 40px 24px 40px; border-bottom: 1px solid #E8E3D8;">
              <img src="${appUrl}/SYRENAH_logo_napis.png" alt="Syrenah" width="160" style="display: block; max-width: 160px; height: auto;" />
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 40px 40px 16px 40px;">
              <span style="font-size: 36px; line-height: 1;">\u{1F90D}</span>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 8px 40px;">
              <h1 style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 22px; font-weight: 400; color: #2C2C2C; letter-spacing: 1px;">
                ${L.title}
              </h1>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 40px 24px 40px;">
              <p style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 13px; color: #8B7D6B; letter-spacing: 2px; text-transform: uppercase;">
                ${locale === "en" ? "Order" : "Zamówienie"} ${shortOrderId}
              </p>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 0 60px;">
              <div style="height: 1px; background-color: #E8E3D8; width: 60px;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding: 28px 50px 16px 50px;">
              <p style="margin: 0 0 16px 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 15px; line-height: 1.7; color: #4A4A4A; text-align: center;">
                ${greeting},
              </p>
              <p style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 15px; line-height: 1.7; color: #4A4A4A; text-align: center;">
                ${L.body}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 16px 50px 24px 50px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0;">
                <tr>
                  <td style="padding: 20px; background-color: #FAF8F5; border: 1px solid #E8E3D8;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 13px; color: #8B7D6B; text-transform: uppercase; letter-spacing: 2px; padding-bottom: 12px;">
                          ${L.detailsTitle}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 14px; color: #2C2C2C; padding: 4px 0;">
                          <strong>${L.numberLabel}</strong> ${shortOrderId}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 14px; color: #2C2C2C; padding: 4px 0;">
                          <strong>${L.amountLabel}</strong> ${amount}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 8px 50px 40px 50px;">
              <a href="${trackingUrl}" style="display: inline-block; padding: 14px 36px; background-color: #C1A88C; color: #FFFFFF; text-decoration: none; font-family: 'Georgia', 'Times New Roman', serif; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; border: none;">
                ${L.cta}
              </a>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 1px; background-color: #E8E3D8;"></div>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding: 30px 40px 40px 40px;">
              <p style="margin: 0 0 8px 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 14px; color: #C1A88C; font-style: italic;">
                ${L.signoff}
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

        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">
          <tr>
            <td align="center" style="padding: 24px 20px;">
              <p style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; font-size: 11px; color: #B0A89E; line-height: 1.6;">
                ${L.footerNote}
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

export function orderConfirmationSubject(
  orderId: string,
  locale: "pl" | "en" = "pl"
): string {
  const short = formatOrderId(orderId);
  const L = locale === "en" ? copy.en : copy.pl;
  return L.subject(short);
}
