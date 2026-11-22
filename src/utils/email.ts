import emailjs from '@emailjs/browser';
import { sendNotification } from './notifications';

export const sendEmailNotification = async (
  toEmail: string,
  subject: string,
  message: string,
  type: 'deposit' | 'withdrawal' | 'investment' | 'earning' | 'kyc' | 'support',
  userName: string = 'Valued Investor'
) => {
  // Always trigger in-app notification
  sendNotification(toEmail, subject, message, type);

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey || serviceId === 'your_service_id') {
    console.log(`[EmailJS fallback] Email would be sent to ${toEmail} | Subject: "${subject}" | Message: "${message}"`);
    return;
  }

  try {
    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: toEmail,
        subject,
        message,
        user_name: userName,
        date: new Date().toLocaleDateString()
      },
      publicKey
    );
  } catch (err) {
    console.error('EmailJS send error:', err);
    console.log(`[EmailJS fallback] Email would be sent to ${toEmail} | Subject: "${subject}" | Message: "${message}"`);
  }
};
