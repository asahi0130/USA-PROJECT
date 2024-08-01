// pages/api/addFriend.js

import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: "Method not allowed" });
//   }

  try {
    const { db } = await connectToDatabase();
    const { email, friend } = req.body;


    // Check if the friend's email exists in the database
    const friendExists = await db.collection('users').findOne({ email: friend });
    if (!friendExists) {
      return res.status(404).json({ message: "Friend's email not found" });
    }

    // Add friend to the friends array field if it doesn't already exist
    const update = { $addToSet: { friends: friend } };
    const options = { returnDocument: 'after' };

    const result = await db.collection('users').findOneAndUpdate({ email }, update, options);


    res.status(200).json({ message: 'Friend added successfully', data: result.value });
  } catch (error) {
    console.error("MongoDB operation failed:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
