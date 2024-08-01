// /pages/api/searchFriend.js
import { connectToDatabase } from '../../lib/mongodb';
import axios from 'axios';

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
    
    // Get the user with the specified email
    const currentUser = await db.collection('users').findOne({ email: email });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Fetch all users except the one with the specified email
    const users = await db.collection('users').find({ email: { $ne: email } }).toArray();

    // Format users data for the comparison
    const usersArray = users.map(user => ({
      name: user.name,
      email: user.email,
      social: user.social,
      intro: user.intro
    }));

    // Prepare the prompt for OpenAI
    const input = `You are an assistant that finds users with similar interests. Here is a user's introduction:\n\n"${currentUser.intro}"\n\nPlease find the user from the following list that has the most similar introduction:\n\n${usersArray.map(user => `Name: "${user.name}", Email: "${user.email}", Intro: "${user.intro}"\n`).join('\n')}.
    
    Only return the name, email, and intro of the most similar user. Do not return anything else.`;

    // Call OpenAI API using Axios
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: input },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer sk-proj-Xr8CBA97m0N9rv7pFb69T3BlbkFJOjynveAL1GQxDgqLfLHp`,
        },
      }
    );

    // Get the assistant's response
    const similarUserResponse = response.data.choices[0].message.content.trim();
    console.log("chatgpt response: " + similarUserResponse);

    // Extract the email from the assistant's response
    const emailMatch = similarUserResponse.match(/Email: "([^"]+)"/);
    let similarUserEmail = null;

    if (emailMatch) {
      similarUserEmail = emailMatch[1];

      // Find the user object with the matching email
      const similarUser = usersArray.find(user => user.email === similarUserEmail);

      if (similarUser) {
        // Return the matched user if found
        return res.status(200).json({ data: similarUser });
      }
    }

    // Additional keyword similarity matching
    let similarUser = usersArray.find(user => {
      const userKeywords = user.intro.toLowerCase().split(/[\s,]+/);
      const currentUserKeywords = currentUser.intro.toLowerCase().split(/[\s,]+/);
      const commonKeywords = userKeywords.filter(keyword => currentUserKeywords.includes(keyword));
      return commonKeywords.length > 2; // Adjust the threshold as needed
    });

    if (!similarUser) {
      // Select a random user if no similar user is found
      const otherUsers = usersArray.filter(user => user.email !== email);
      similarUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
    }

    res.status(200).json({ data: similarUser });
  } catch (error) {
    console.error("Operation failed:", error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
