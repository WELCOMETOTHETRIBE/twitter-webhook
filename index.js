import express from 'express';
import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

// Load env variables
dotenv.config();

// Debug: Log essential variables (only partial for security)
console.log('🔑 Loaded Twitter credentials:');
console.log('TWITTER_API_KEY:', process.env.TWITTER_API_KEY?.slice(0, 4) + '...');
console.log('TWITTER_API_SECRET:', process.env.TWITTER_API_SECRET?.slice(0, 4) + '...');
console.log('TWITTER_ACCESS_TOKEN:', process.env.TWITTER_ACCESS_TOKEN?.slice(0, 4) + '...');
console.log('TWITTER_ACCESS_TOKEN_SECRET:', process.env.TWITTER_ACCESS_TOKEN_SECRET?.slice(0, 4) + '...');

// Initialize Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Run authentication test
async function testAuth() {
  try {
    const me = await twitterClient.v2.me();
    console.log('✅ Authentication successful. User:', me.data.username);
  } catch (error) {
    console.error('❌ Failed to authenticate with Twitter API:', extractError(error));
  }
}

// Utility function to parse and format errors
function extractError(err) {
  if (!err) return 'Unknown error';
  if (err.data) return JSON.stringify(err.data, null, 2);
  if (err.message) return err.message;
  return JSON.stringify(err, null, 2);
}

// Express server
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Tweet endpoint
app.post('/tweet', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    console.warn('⚠️ No "text" field in request body');
    return res.status(400).json({ error: 'Missing "text" in request body' });
  }

  try {
    const response = await twitterClient.v2.tweet(text);
    console.log('✅ Tweet posted successfully:', response);
    return res.status(200).json({ success: true, tweet: response });
  } catch (error) {
    console.error('❌ Failed to tweet:', extractError(error));
    return res.status(500).json({
      success: false,
      error: extractError(error),
      code: error.code || 'unknown',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  testAuth();
});

