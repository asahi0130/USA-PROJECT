// /api/getLocation.js
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const { db } = await connectToDatabase();
    const location = await db.collection('locations').findOne({ email: email });

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json({ data: location });
  } catch (error) {
    console.error("MongoDB operation failed:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
