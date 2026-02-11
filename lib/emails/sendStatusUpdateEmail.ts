import { resend } from "@/lib/email";
import { statusUpdateEmail } from "@/lib/emails/statusUpdate";

type OrderForEmail = {
  id: string;
  shippingEmail?: string | null;
  shippingName?: string | null;
  shippingMethod?: string | null;
  user?: {
    email: string;
    name?: string | null;
  } | null;
};

type SendStatusUpdateOptions = {
  order: OrderForEmail;
  newStatus: string;
  trackingNumber?: string;
};

const STATUSES_WITH_EMAIL = ["PROCESSING", "SHIPPED", "DELIVERED"] as const;
type EmailStatus = (typeof STATUSES_WITH_EMAIL)[number];

export async function sendStatusUpdateEmail({
  order,
  newStatus,
  trackingNumber,
}: SendStatusUpdateOptions): Promise<{ success: boolean; error?: string }> {
  // Sprawdź czy status wymaga wysłania maila
  if (!STATUSES_WITH_EMAIL.includes(newStatus as EmailStatus)) {
    return { success: true }; // Nie wysyłamy maila dla tego statusu
  }

  // Znajdź adres email odbiorcy
  const recipientEmail = order.shippingEmail || order.user?.email;
  if (!recipientEmail) {
    console.warn(
      `No email address found for order ${order.id}, skipping status email`
    );
    return { success: false, error: "No recipient email" };
  }

  const customerName = order.shippingName || order.user?.name || undefined;

  // Mapuj metody wysyłki na czytelne nazwy
  const shippingMethodLabels: Record<string, string> = {
    courier: "Kurier DPD",
    parcel_locker: "Paczkomat InPost",
    inpost_courier: "Kurier InPost",
  };

  const shippingMethodLabel = order.shippingMethod
    ? shippingMethodLabels[order.shippingMethod] || order.shippingMethod
    : undefined;

  try {
    const { subject, html } = statusUpdateEmail({
      orderId: order.id,
      customerName,
      status: newStatus as EmailStatus,
      trackingNumber,
      shippingMethod: shippingMethodLabel,
    });

    const result = await resend.emails.send({
      from: "Syrenah Store <onboarding@resend.dev>",
      to: recipientEmail,
      subject,
      html,
    });

    console.log(
      `Status email sent for order ${order.id} (${newStatus}):`,
      result
    );
    return { success: true };
  } catch (error) {
    console.error(
      `Failed to send status email for order ${order.id} (${newStatus}):`,
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
