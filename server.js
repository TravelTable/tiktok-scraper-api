// server.js
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// GET endpoint to accept a TikTok video URL
app.get('/api/tiktok', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing "url" query parameter.' });
  }

  let browser;
  try {
    // Launch Puppeteer with production-friendly flags
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set request headers so TikTok returns the full version of the page
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
      'AppleWebKit/537.36 (KHTML, like Gecko) ' +
      'Chrome/117.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.tiktok.com/'
    });

    // Navigate to the TikTok video URL and wait until the network is idle
    await page.goto(videoUrl, { waitUntil: 'networkidle2', timeout: 0 });
    
    // Wait for the JSON data embedded in the page
    await page.waitForSelector('script#SIGI_STATE', { timeout: 10000 });

    // Extract the JSON data from the page
    const data = await page.evaluate(() => {
      const scriptTag = document.querySelector('script#SIGI_STATE');
      if (!scriptTag) return null;

      let jsonData;
      try {
        jsonData = JSON.parse(scriptTag.innerText);
      } catch (e) {
        return null;
      }

      // The video details are stored under the "ItemModule" key.
      const itemModule = jsonData.ItemModule;
      if (!itemModule) return null;

      const videoIds = Object.keys(itemModule);
      if (videoIds.length === 0) return null;
      const videoData = itemModule[videoIds[0]]; // assuming one video per page

      // Extract video details
      const videoInfo = videoData.video || {};
      const stats = videoData.stats || {};

      // Typically, TikTok provides a lower quality link in playAddr,
      // and an HD link in downloadAddr if available.
      const hdVideoUrl = videoInfo.downloadAddr || null;
      const sdVideoUrl = videoInfo.playAddr || null;

      return {
        video_id: videoData.id,
        description: videoData.desc,
        author: videoData.author,
        // HD video (if available) and a standard quality link.
        hd_video: hdVideoUrl,
        sd_video: sdVideoUrl,
        cover: videoInfo.originCover,
        likes: stats.diggCount,
        shares: stats.shareCount,
        comments: stats.commentCount,
        views: stats.playCount,
      };
    });

    if (!data) {
      return res.status(500).json({ error: 'Failed to extract video data from TikTok page.' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error scraping TikTok:', error);
    res.status(500).json({ error: 'Error scraping TikTok page.' });
  } finally {
    if (browser) await browser.close();
  }
});

// Basic route to verify that the API is running
app.get('/', (req, res) => {
  res.send('TikTok Scraping API is Running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
