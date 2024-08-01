import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://asahi:2Ipkwh4zlUsH358S@rufreern.zqyv3fq.mongodb.net/?retryWrites=true&w=majority&appName=RUFREERN'; // Adjust the URI as needed
let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedDb) {
    return {
      client: cachedClient,
      db: cachedDb,

    };
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db('usa');

  cachedClient = client;
  cachedDb = db;

  return {
    client: cachedClient,
    db: cachedDb,
  };
}