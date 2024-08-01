import webpush from 'web-push';




const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const WEB_PUSH_EMAIL = process.env.WEB_PUSH_EMAIL;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && WEB_PUSH_EMAIL) {
  webpush.setVapidDetails(
    WEB_PUSH_EMAIL,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} else {
  console.error('VAPID keys and email must be set in the environment variables');
}


export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { subscription, title, body } = req.body;

    try {
      await webpush.sendNotification(
        subscription,
        JSON.stringify({ title, body }),
        { urgency: 'high', TTL: 86400 }
      );
      res.status(200).json({ message: 'Notification sent successfully.' });
    } catch (error) {
      console.error('Error sending notification', error);
      res.status(500).json({ error: 'Failed to send notification.', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
