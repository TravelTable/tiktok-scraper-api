const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { getXbogus } = require('./xbogus');
const { HttpsProxyAgent } = require('https-proxy-agent'); // IMPORTANT: Added this
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load proxies (Webshare 5 private proxies)
const proxies = [
    { host: "212.60.14.146", port: 6943, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "156.237.48.221", port: 7122, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "156.237.26.78", port: 5976, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "62.164.228.15", port: 8327, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "72.1.179.38", port: 6432, username: "ihqqebfi", password: "m65ebvc3vi3w" }
];

// Load random user-agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15A372 Safari/604.1'
];

// Random proxy picker
function getRandomProxy() {
  return proxies[Math.floor(Math.random() * proxies.length)];
}

// Random user-agent picker
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

// 🎯 Real Scrape Endpoint
app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'Missing TikTok URL.' });
  }

  const maxRetries = 5;
  let attempt = 0;
  let success = false;
  let finalError = null;

  while (attempt < maxRetries && !success) {
    const proxy = getRandomProxy();
    const userAgent = getRandomUserAgent();
    attempt++;

    try {
      const proxyUrl = `http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`;
      const agent = new HttpsProxyAgent(proxyUrl); // <-- 🔥 HERE IS THE FIX

      const xbogus = getXbogus(url, userAgent);
      const fullUrl = `${url.includes('?') ? url + '&' : url + '?'}X-Bogus=${xbogus}`;

      const response = await axios.get(fullUrl, {
        headers: {
          'User-Agent': userAgent,
          'Referer': 'https://www.tiktok.com/',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        httpsAgent: agent, // <-- 🔥 USE httpsAgent instead of proxy
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const jsonText = $('script[id="__NEXT_DATA__"]').html();
      if (!jsonText) {
        throw new Error('TikTok structure not found.');
      }

      const data = JSON.parse(jsonText);
      const videoData = data.props.pageProps.itemInfo.itemStruct;

      if (!videoData) {
        throw new Error('Video data not found.');
      }

      res.json({
        caption: videoData.desc || null,
        author: videoData.author?.uniqueId || null,
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
    res.status(500).json({ error: 'Failed after multiple proxy attempts: ' + finalError.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
