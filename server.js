const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { getXbogus } = require('./xbogus');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Load proxies
const proxies = [
    { host: "64.137.108.3", port: 5596, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "64.137.101.31", port: 5345, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "146.103.55.91", port: 6143, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "198.37.99.112", port: 5903, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "154.29.25.184", port: 7195, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "217.198.177.161", port: 5677, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "31.56.139.91", port: 6160, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "91.124.253.231", port: 6591, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "193.161.2.249", port: 6672, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "37.44.218.222", port: 5905, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "64.137.48.126", port: 6333, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "69.58.9.142", port: 7212, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.67.2.246", port: 5820, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.151.161.219", port: 6310, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "161.123.5.227", port: 5276, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "31.57.82.232", port: 6813, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "38.225.11.157", port: 5438, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.43.167.105", port: 6287, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "104.239.13.86", port: 6715, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "168.199.159.4", port: 6065, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "104.222.168.209", port: 6025, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "216.173.80.68", port: 6325, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "38.225.3.104", port: 5387, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "104.252.71.156", port: 6084, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "104.253.13.195", port: 5627, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "184.174.25.40", port: 5929, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "67.227.119.23", port: 6352, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "67.227.1.236", port: 6517, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "162.220.246.158", port: 6442, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.138.119.165", port: 5914, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "104.168.118.246", port: 6202, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "194.116.249.20", port: 5871, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "38.170.175.32", port: 5701, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "154.29.233.2", port: 5763, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "38.170.171.86", port: 5786, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.131.102.5", port: 5657, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "64.137.80.118", port: 5145, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "103.76.117.121", port: 6386, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "107.181.142.233", port: 5826, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "199.180.9.163", port: 6183, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "216.74.80.218", port: 6790, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "31.59.27.49", port: 6626, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.38.86.225", port: 6154, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.39.31.72", port: 5499, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "188.215.7.225", port: 6289, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "192.3.48.130", port: 6123, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "206.206.71.44", port: 5684, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "23.27.203.133", port: 6868, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "31.59.10.54", port: 5625, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "87.239.253.180", port: 6429, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "82.23.209.150", port: 5991, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "104.249.31.7", port: 6091, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "140.99.194.213", port: 7590, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "168.199.132.199", port: 6271, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "193.36.172.7", port: 6090, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.39.4.38", port: 5463, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "104.143.246.13", port: 5968, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "148.135.151.132", port: 5625, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "191.96.171.38", port: 6551, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.43.94.72", port: 7322, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "50.114.28.42", port: 5527, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "82.21.219.127", port: 6468, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "142.111.255.170", port: 5459, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "194.5.3.168", port: 5680, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "67.227.1.216", port: 6497, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "104.239.97.253", port: 6006, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "37.44.218.131", port: 5814, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.41.172.186", port: 5929, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "173.239.219.86", port: 5995, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "23.26.71.123", port: 5606, username: "ihqqebfi", password: "m65ebvc3vi3w" },
    { host: "45.41.177.59", port: 5709, username: "ihqqebfi", password: "m65ebvc3vi3w" },
  ];

// Load random user-agents
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15A372 Safari/604.1',
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

// 🎯 Real Scrape Endpoint with Proxy Retry
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
      const xbogus = getXbogus(url, userAgent);
      const fullUrl = `${url.includes('?') ? url + '&' : url + '?'}X-Bogus=${xbogus}`;

      const response = await axios.get(fullUrl, {
        headers: {
          'User-Agent': userAgent,
          'Referer': 'https://www.tiktok.com/',
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

      success = true; // ✅ Request succeeded
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
