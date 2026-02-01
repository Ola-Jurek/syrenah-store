type OrderConfirmationProps = {
    orderId: string;
    total: number;
    trackingUrl: string;
  };

function formatOrderId(orderId: string): string {
  return `#${orderId.slice(0, 8).toUpperCase()}`;
}
  
  export function orderConfirmationEmail({
    orderId,
    total,
    trackingUrl,
  }: OrderConfirmationProps) {
    const shortOrderId = formatOrderId(orderId);
    
    return `
      <h1>Dziękujemy za zamówienie 🤍</h1>
      <p>Twoje zamówienie zostało przyjęte.</p>
  
      <p><strong>Numer zamówienia:</strong> ${shortOrderId}</p>
      <p><strong>Kwota:</strong> ${total} zł</p>
  
      <p>
        Wkrótce otrzymasz kolejne informacje dotyczące wysyłki.
      </p>
  
      <div style="margin: 30px 0;">
        <a href="${trackingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: 500;">
          Śledź zamówienie
        </a>
      </div>
  
      <p>
        Syrenah
      </p>
    `;
  }
  