const express = require('express');
const cors = require('cors'); // (NEW: You need CORS)
const app = express();
const { getXbogus } = require('./xbogus');

// Middleware
app.use(cors()); // (NEW: Allow cross-origin requests)
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

// 🚀 NEW SCRAPER ENDPOINT
app.post('/scrape', async (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'Missing TikTok URL.' });
    }

    try {
        // -- Placeholder Scraper Response --
        const data = {
            video_url: "https://example.com/video.mp4",
            caption: "Sample TikTok Caption",
            author: "username",
            likes: 1000,
            shares: 100,
            comments: 50,
            thumbnail: "https://example.com/thumbnail.jpg",
            music: "Song Name",
            upload_date: "2024-04-01"
        };
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to scrape TikTok.' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
