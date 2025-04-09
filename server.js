const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { getXbogus } = require('./xbogus'); // Keep your xbogus.js
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Webshare Proxies
const proxies = [
  { host: "212.60.14.146", port: 6943, username: "ihqqebfi", password: "m65ebvc3vi3w" },
  { host: "156.237.48.221", port: 7122, username: "ihqqebfi", password: "m65ebvc3vi3w" },
  { host: "156.237.26.78", port: 5976, username: "ihqqebfi", password: "m65ebvc3vi3w" },
  { host: "62.164.228.15", port: 8327, username: "ihqqebfi", password: "m65ebvc3vi3w" },
  { host: "72.1.179.38", port: 6432, username: "ihqqebfi", password: "m65ebvc3vi3w" }
];

// Mobile User-Agents
const userAgents = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
];

// Randomly select a proxy
function getRandomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

// Randomly select a user agent
function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Build TikTok API URL
function buildScrapeUrl(videoId, userAgent) {
  const baseUrl = `https://www.tiktok.com/api/item/detail/?itemId=${videoId}&aid=1988&app_name=tiktok_web&device_platform=webapp&referer=https://www.tiktok.com/`;
  const xbogus = getXbogus(baseUrl, userAgent);
  return `${baseUrl}&X-Bogus=${xbogus}`;
}

// 🎯 Endpoint to Generate X-Bogus (still working)
app.post('/generate-xbogus', (req, res) => {
  const { url, userAgent } = req.body;
  if (!url || !userAgent) {
    return res.status(400).json({ error: 'Missing url or userAgent' });
  }
  const xbogus = getXbogus(url, userAgent);
  res.json({ xbogus });
});

// 🎯 TikTok Scrape Endpoint (NEW GET METHOD)
app.get('/scrape', async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing TikTok URL.' });
  }

  const videoIdMatch = url.match(/video\/(\d+)/);
  if (!videoIdMatch) {
    return res.status(400).json({ error: 'Invalid TikTok URL format.' });
  }

  const videoId = videoIdMatch[1];
  const maxRetries = 5;
  let attempt = 0;
  let success = false;
  let lastError = null;

  while (attempt < maxRetries && !success) {
    const proxy = getRandomProxy();
    const userAgent = getRandomUserAgent();
    attempt++;

    try {
      const apiUrl = buildScrapeUrl(videoId, userAgent);

      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': userAgent,
          'Referer': 'https://www.tiktok.com/',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'application/json',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
          'sec-fetch-site': 'same-origin',
          'sec-fetch-mode': 'cors',
          'sec-fetch-dest': 'empty',
          'sec-ch-ua': '"Not_A Brand";v="99", "Safari";v="16"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"iOS"'
        },
        proxy: {
          host: proxy.host,
          port: proxy.port,
          auth: {
            username: proxy.username,
            password: proxy.password,
          },
        },
        timeout: 10000
      });

      const item = response.data?.itemInfo?.itemStruct;
      if (!item) throw new Error('Item not found');

      res.json({
        caption: item.desc || null,
        author: item.author?.uniqueId || null,
        video_url: item.video?.playAddr || null,
        thumbnail: item.video?.cover || null,
        likes: item.stats?.diggCount || null,
        shares: item.stats?.shareCount || null,
        comments: item.stats?.commentCount || null,
        music: item.music?.title || null,
        upload_date: item.createTime ? new Date(item.createTime * 1000).toISOString() : null,
      });

      success = true;
    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      lastError = error;
    }
  }

  if (!success) {
    res.status(500).json({ error: 'Failed after multiple proxy attempts: ' + lastError.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
