import 'dotenv/config'; // Loads .env (works even if you’re using Railway vars)
import express from 'express';
import { TwitterApi } from 'twitter-api-v2';

const app = express();
app.use(express.json());

// Twitter client using env vars (Railway or .env)
const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;

app.post('/tweet', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Missing tweet text' });
  }

  try {
    const tweet = await rwClient.v2.tweet(text);
    console.log('✅ Tweeted:', tweet.data);
    res.status(200).json({ success: true, tweet: tweet.data });
  } catch (error) {
    console.error('❌ Failed to tweet');
    console.error('Twitter API Error:', error?.data?.errors || error.message);
    res.status(500).json({
      error: 'Failed to tweet',
      details: error?.data?.errors || error.message,
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`➡️  Ready to POST to /tweet`);
});

