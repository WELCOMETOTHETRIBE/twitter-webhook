// index.js
import express from 'express';
import { TwitterApi } from 'twitter-api-v2';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;

app.get('/health', (_, res) => res.send('✅ Running'));

app.post('/tweet', async (req, res) => {
  const { text, image_url } = req.body;

  if (!text) return res.status(400).json({ error: 'Missing tweet text' });

  try {
    let mediaId;

    if (image_url) {
      const imageRes = await fetch(image_url);
      if (!imageRes.ok) throw new Error('Image fetch failed');

      const buffer = await imageRes.buffer();
      const contentType = imageRes.headers.get('content-type') || 'image/jpeg';

      mediaId = await client.v1.uploadMedia(buffer, { mimeType: contentType });
      console.log('📸 Uploaded media ID:', mediaId);
    }

    const tweetData = mediaId
      ? { text, media: { media_ids: [mediaId] } }
      : { text };

    const tweet = await rwClient.v2.tweet(tweetData);
    console.log('✅ Tweeted:', tweet);
    res.status(200).json({ success: true, tweet });
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
});

