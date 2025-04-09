const express = require('express');
const cors = require('cors');
const axios = require('axios'); // <-- (NEW) We need Axios for making HTTP requests
const app = express();
const { getXbogus } = require('./xbogus');

// Middleware
app.use(cors());
app.use(express.json());

// EXISTING ENDPOINT
app.post('/generate-xbogus', (req, res) => {
    const { url, userAgent } = req.body;
    if (!url || !userAgent) {
        return res.status(400).json({ error: 'Missing url or userAgent' });
    }
    const xbogus = getXbogus(url, userAgent);
    res.json({ xbogus });
});

const cheerio = require('cheerio'); // ADD this at the top with other requires

app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'Missing TikTok URL.' });
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
                'Referer': 'https://www.tiktok.com/',
            }
        });

        const $ = cheerio.load(response.data);
        const scriptTag = $('script[id="SIGI_STATE"]').html();
        const data = JSON.parse(scriptTag);

        const item = data?.ItemModule ? Object.values(data.ItemModule)[0] : null;

        if (!item) {
            return res.status(404).json({ error: 'Video not found or data structure changed.' });
        }

        res.json({
            caption: item.desc || null,
            author: item.author || null,
            video_url: item.video?.playAddr || null,
            thumbnail: item.video?.cover || null,
            likes: item.stats?.diggCount || null,
            shares: item.stats?.shareCount || null,
            comments: item.stats?.commentCount || null,
            music: item.music?.title || null,
            upload_date: item.createTime ? new Date(item.createTime * 1000).toISOString() : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to scrape TikTok.' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
