export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { resend } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    // Walidacja
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Imię, e-mail i wiadomość są wymagane." },
        { status: 400 }
      );
    }

    // Prosta walidacja e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Podaj poprawny adres e-mail." },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { error: "Wiadomość musi zawierać co najmniej 10 znaków." },
        { status: 400 }
      );
    }

    // Wyślij e-mail na adres sklepu
    const storeEmail = process.env.STORE_CONTACT_EMAIL || "info@syrenahthelabel.com";

    await resend.emails.send({
      from: "Syrenah Store <onboarding@resend.dev>",
      to: storeEmail,
      subject: `Formularz kontaktowy: ${subject || "Bez tematu"} — od ${name}`,
      replyTo: email,
      html: `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
</head>
<body style="margin:0; padding:0; background-color:#FAF8F5; font-family: Georgia, 'Times New Roman', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAF8F5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF; border: 1px solid #E8E3D8;">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px 24px; border-bottom: 1px solid #E8E3D8;">
              <p style="margin:0; font-size: 11px; letter-spacing: 3px; color: #8B7D6B; text-transform: uppercase;">
                Nowa wiadomość kontaktowa
              </p>
              <h1 style="margin: 8px 0 0; font-size: 22px; color: #1a1a1a; font-weight: normal;">
                ${subject || "Wiadomość ze strony"}
              </h1>
            </td>
          </tr>

          <!-- Dane nadawcy -->
          <tr>
            <td style="padding: 24px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 12px 16px; background-color: #FAF8F5; border: 1px solid #E8E3D8;">
                    <p style="margin: 0 0 4px; font-size: 11px; color: #8B7D6B; text-transform: uppercase; letter-spacing: 2px;">
                      Od
                    </p>
                    <p style="margin: 0; font-size: 15px; color: #1a1a1a;">
                      ${name}
                    </p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #666;">
                      ${email}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Treść wiadomości -->
          <tr>
            <td style="padding: 0 40px 32px;">
              <p style="margin: 0 0 8px; font-size: 11px; color: #8B7D6B; text-transform: uppercase; letter-spacing: 2px;">
                Wiadomość
              </p>
              <div style="font-size: 14px; color: #2C2C2C; line-height: 1.7; white-space: pre-wrap;">
${message}
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; border-top: 1px solid #E8E3D8; background-color: #FAF8F5;">
              <p style="margin:0; font-size: 11px; color: #8B7D6B; text-align: center;">
                Ta wiadomość została wysłana z formularza kontaktowego na stronie Syrenah
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    });

    return NextResponse.json({ success: true, message: "Wiadomość została wysłana pomyślnie." });
  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później." },
      { status: 500 }
    );
  }
}
