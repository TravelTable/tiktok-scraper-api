const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { getXbogus } = require('./xbogus');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Your 5 Webshare proxies
const proxies = [
  { host: "212.60.14.146", port: 6943, username: "ihqqebfi", password: "m65ebvc3vi3w" },
  { host: "156.237.48.221", port: 7122, username: "ihqqebfi", password: "m65ebvc3vi3w" },
  { host: "156.237.26.78", port: 5976, username: "ihqqebfi", password: "m65ebvc3vi3w" },
  { host: "62.164.228.15", port: 8327, username: "ihqqebfi", password: "m65ebvc3vi3w" },
  { host: "72.1.179.38", port: 6432, username: "ihqqebfi", password: "m65ebvc3vi3w" }
];

// User-agents
const userAgents = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15A372 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36',
];

// Random proxy
function getRandomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

// Random user-agent
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// 🎯 X-Bogus Endpoint
app.post('/generate-xbogus', (req, res) => {
  const { url, userAgent } = req.body;
  if (!url || !userAgent) {
    return res.status(400).json({ error: 'Missing url or userAgent' });
  }
  const xbogus = getXbogus(url, userAgent);
  res.json({ xbogus });
});

// 🎯 Real Scraper
app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing TikTok URL.' });
  }

  const maxRetries = 5;
  let attempt = 0;
  let finalError = null;
  let success = false;

  while (attempt < maxRetries && !success) {
    const proxy = getRandomProxy();
    const userAgent = getRandomUserAgent();
    attempt++;

    try {
      // Force mobile version
      let mobileUrl = url.replace('www.tiktok.com', 'm.tiktok.com');

      const xbogus = getXbogus(mobileUrl, userAgent);
      const fullUrl = `${mobileUrl.includes('?') ? mobileUrl + '&' : mobileUrl + '?'}X-Bogus=${xbogus}`;

      const response = await axios.get(fullUrl, {
        headers: {
          'User-Agent': userAgent,
          'Referer': 'https://m.tiktok.com/',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        proxy: {
          host: proxy.host,
          port: proxy.port,
          auth: {
            username: proxy.username,
            password: proxy.password,
          },
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const sigiScript = $('script[id="SIGI_STATE"]').html();

      if (!sigiScript) {
        throw new Error('SIGI_STATE not found.');
      }

      const sigiJson = JSON.parse(sigiScript);
      const videoKey = Object.keys(sigiJson.ItemModule || {})[0];
      const videoData = sigiJson.ItemModule?.[videoKey];

      if (!videoData) {
        throw new Error('Video data not found.');
      }

      res.json({
        caption: videoData.desc || null,
        author: videoData.author || null,
        video_url: videoData.video?.playAddr || null,
        thumbnail: videoData.video?.cover || null,
        likes: videoData.stats?.diggCount || null,
        shares: videoData.stats?.shareCount || null,
        comments: videoData.stats?.commentCount || null,
        music: videoData.music?.title || null,
        upload_date: videoData.createTime ? new Date(videoData.createTime * 1000).toISOString() : null,
      });

      success = true;
    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      finalError = error;
    }
  }

  if (!success) {
    res.status(500).json({ error: 'Failed after retries: ' + finalError.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
