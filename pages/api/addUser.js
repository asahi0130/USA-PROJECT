import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { db } = await connectToDatabase();
    const { name, email, social, intro, friends } = req.body;

    const options = {
      upsert: true, // This creates a new document if one doesn't exist
      returnDocument: 'after' // Ensures the modified document is returned
    };

    // Fetch existing user to check the current state of the friends array
    const existingUser = await db.collection('users').findOne({ email });

    const update = {
      $set: {
        friends: existingUser && existingUser.friends ? existingUser.friends : [] // Ensure friends array is always initialized
      }
    };

    if (name) update.$set.name = name;
    if (social) update.$set.social = social;
    if (intro) update.$set.intro = intro;

    if (friends && friends.length > 0) {
      update.$addToSet = { friends: { $each: friends } }; // Add new friends without clearing existing ones
    }

    const result = await db.collection('users').findOneAndUpdate({ email }, update, options);

    if (!result.value) {
      // Log the request body to debug further why upsert may not be working
      console.log("Request data:", req.body);
      return res.status(404).json({ message: "No user found or created, check logs for more info." });
    }

    res.status(200).json({ message: 'User updated successfully', data: result.value });
  } catch (error) {
    console.error("MongoDB operation failed:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
