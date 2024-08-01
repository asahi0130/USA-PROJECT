// /api/updateLocation.js
import { connectToDatabase } from '../../lib/mongodb';
import { format } from 'date-fns-tz';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();
    const { email, lat, long, time } = req.body;

    if (!email || !lat || !long) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Convert current time to JST
    // const time = format(new Date(), 'yyyy-MM-dd HH:mm:ssXXX', { timeZone: 'Asia/Tokyo' });

    const options = {
      upsert: true, // Create a new document if one doesn't exist
      returnDocument: 'after' // Ensures the modified document is returned
    };

    const update = { $set: { email, lat, long, time } };
    const result = await db.collection('locations').findOneAndUpdate({ email }, update, options);



    res.status(200).json({ message: 'Location updated successfully', data: result.value });
  } catch (error) {
    console.error("MongoDB operation failed:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
