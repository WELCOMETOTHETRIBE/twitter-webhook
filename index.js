import express from 'express';
import { TwitterApi } from 'twitter-api-v2';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;

// Helper to fetch remote file as a Buffer
async function fetchFileBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`❌ Failed to download media from ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

app.get('/health', (_, res) => res.send('✅ Server is alive'));

app.post('/tweet', async (req, res) => {
  const { text, image_url, video_url } = req.body;

  if (!text) return res.status(400).json({ error: 'Missing tweet text' });

  try {
    let mediaId = null;

    if (image_url) {
      const imageBuffer = await fetchFileBuffer(image_url);
      mediaId = await rwClient.v1.uploadMedia(imageBuffer, { mimeType: 'image/jpeg' });
    }

    if (video_url) {
      const videoBuffer = await fetchFileBuffer(video_url);
      mediaId = await rwClient.v1.uploadMedia(videoBuffer, { mimeType: 'video/mp4' });
    }

    const tweet = await rwClient.v2.tweet(
      mediaId ? { text, media: { media_ids: [mediaId] } } : { text }
    );

    console.log('✅ Tweet posted:', tweet);
    res.status(200).json({ success: true, tweet });
  } catch (error) {
    console.error('❌ Error tweeting:', error);
    res.status(500).json({ error: 'Failed to tweet', details: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

