import { connectToDatabase } from '../../lib/mongodb';  // Ensure you have a MongoDB connection helper

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { email, noti } = req.body;

    // Input validation
    if (!email || noti === undefined) {
        return res.status(400).json({ message: 'Email and notification setting are required' });
    }

    try {
        const { db } = await connectToDatabase();
        const collection = db.collection('users');

        // Check the current notification setting for the given email
        const user = await collection.findOne({ email: email }, { projection: { noti: 1 } });

        if (user && user.noti === noti) {
            // If the existing notification is the same as the one provided, do nothing
            return res.status(200).json({ message: 'Notification setting is already up to date.' });
        } else {
            // Update the notification setting if it is different
            const updateResult = await collection.updateOne(
                { email: email },
                { $set: { noti: noti } }
            );

            if (updateResult.matchedCount === 0) {
                // If no document was matched, it means the user was not found
                return res.status(404).json({ message: 'User not found.' });
            }

            return res.status(200).json({ message: 'Notification setting updated successfully.' });
        }
    } catch (error) {
        console.error('Failed to update notification setting:', error);
        return res.status(500).json({ message: 'Failed to update notification setting', error: error.toString() });
    }
}
