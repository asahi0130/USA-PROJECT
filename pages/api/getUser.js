import { connectToDatabase } from '../../lib/mongodb';




export default async function handler(req, res) {

  const { email } = req.body;

  try {


    const { db } = await connectToDatabase();
    // const email = session?.user?.email; 


    const user = await db.collection('users').findOne({ email: email });

    res.status(200).json({ data: user });
  } catch (error) {
    console.error("MongoDB operation failed:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
