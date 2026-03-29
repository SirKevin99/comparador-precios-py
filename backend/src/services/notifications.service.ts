import { Resend } from "resend";

interface PriceAlertEmailData {
  productName: string;
  storeName: string;
  oldPrice: number;
  newPrice: number;
  productUrl: string;
  currency: string;
}

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;
const resend = new Resend(resendApiKey);

const formatGs = (value: number): string => {
  const normalized = Math.round(value);
  const formatted = normalized.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `Gs. ${formatted}`;
};

const calculatePercentDiff = (oldPrice: number, newPrice: number): string => {
  if (oldPrice <= 0) {
    return "0.00";
  }
  const diff = ((oldPrice - newPrice) / oldPrice) * 100;
  return diff.toFixed(2);
};

export const sendPriceAlert = async (to: string, data: PriceAlertEmailData): Promise<void> => {
  if (!resendApiKey || !emailFrom) {
    throw new Error("Missing RESEND_API_KEY or EMAIL_FROM environment variables");
  }

  const percentDiff = calculatePercentDiff(data.oldPrice, data.newPrice);
  const amountDiff = data.oldPrice - data.newPrice;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #222;">
      <h2 style="margin-bottom: 8px;">Alerta de precio</h2>
      <p style="margin-top: 0;">El producto <strong>${data.productName}</strong> cambió de precio en <strong>${data.storeName}</strong>.</p>
      <p style="margin: 4px 0;"><strong>Precio anterior:</strong> <span style="color: #d32f2f; text-decoration: line-through;">${formatGs(data.oldPrice)}</span></p>
      <p style="margin: 4px 0;"><strong>Precio nuevo:</strong> <span style="color: #2e7d32;">${formatGs(data.newPrice)}</span></p>
      <p style="margin: 4px 0;"><strong>Diferencia:</strong> ${percentDiff}% (${formatGs(Math.abs(amountDiff))})</p>
      <p style="margin: 4px 0;"><strong>Moneda:</strong> ${data.currency}</p>
      <a href="${data.productUrl}" style="display: inline-block; margin-top: 12px; padding: 10px 16px; background: #1976d2; color: #fff; text-decoration: none; border-radius: 4px;">
        Ver producto
      </a>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: emailFrom,
    to,
    subject: `¡Bajó el precio! ${data.productName}`,
    html
  });

  if (error) {
    throw new Error(`Resend sendPriceAlert error: ${error.message}`);
  }
};
