const express = require('express');
const bodyParser = require('body-parser');
const { TwitterApi } = require('twitter-api-v2');

const app = express();
app.use(bodyParser.json());

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

app.post('/tweet', async (req, res) => {
  try {
    const tweetText = req.body.text;
    if (!tweetText) return res.status(400).send('Missing tweet text');

    const response = await client.v1.tweet(tweetText);
    return res.status(200).json({ success: true, tweet_id: response.id_str });
  } catch (err) {
    console.error(err);
    return res.status(500).send('Failed to tweet');
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log('Server running on port ' + (process.env.PORT || 3000))
);

