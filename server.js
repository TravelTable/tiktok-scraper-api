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

// 🚀 REAL SCRAPER ENDPOINT
app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'Missing TikTok URL.' });
    }

    try {
        // Fake user-agent to act like a real browser
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

        // Use your xbogus function to generate signature
        const xbogus = getXbogus(url, userAgent);

        // Append xbogus to the URL
        const fullUrl = `${url}&X-Bogus=${xbogus}`;

        const response = await axios.get(fullUrl, {
            headers: {
                'User-Agent': userAgent,
                'Referer': 'https://www.tiktok.com/',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        const html = response.data;

        // Example: Extract simple info using regex (we can upgrade this later)
        const captionMatch = html.match(/<title data-e2e="video-title">(.*?)<\/title>/);
        const authorMatch = html.match(/<h3 class=".*?@([a-zA-Z0-9_.]+).*?<\/h3>/);

        const data = {
            caption: captionMatch ? captionMatch[1] : null,
            author: authorMatch ? authorMatch[1] : null,
            video_url: url,
            thumbnail: null, // optional - can add later
            likes: null,     // optional - can add later
            shares: null,    // optional - can add later
            comments: null,  // optional - can add later
            music: null,     // optional - can add later
            upload_date: null // optional - can add later
        };

        res.json(data);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Failed to scrape TikTok video.' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
