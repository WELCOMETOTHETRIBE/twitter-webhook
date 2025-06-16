const express = require('express');
const { TwitterApi } = require('twitter-api-v2');

const app = express();
app.use(express.json());

// Log tokens at startup (⚠️ Safe for local debugging — REMOVE in production)
console.log("TWITTER_API_KEY:", process.env.TWITTER_API_KEY);
console.log("TWITTER_API_SECRET:", process.env.TWITTER_API_SECRET);
console.log("TWITTER_ACCESS_TOKEN:", process.env.TWITTER_ACCESS_TOKEN);
console.log("TWITTER_ACCESS_TOKEN_SECRET:", process.env.TWITTER_ACCESS_TOKEN_SECRET);

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

app.post('/tweet', async (req, res) => {
  const { text } = req.body;

  try {
    const response = await client.v2.tweet(text);
    console.log("Tweet posted:", response.data);
    res.status(200).send("Tweet sent");
  } catch (error) {
    console.error("❌ Failed to tweet");
    console.error("Twitter API Error Code:", error.code);
    console.error("Twitter API Message:", error?.data?.errors?.[0]?.message);
    console.error("Full error:", error);
    res.status(500).send("Failed to tweet");
  }
});

app.listen(8080, () => {
  console.log('🚀 Server running on port 8080');
});

