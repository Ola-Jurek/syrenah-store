import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const storeFromEmail = "Syrenah Store <info@syrenahthelabel.com>";
