const express = require('express');
const app = express();
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ✅ RAPIDAPI KEY CHECKER MIDDLEWARE
app.use((req, res, next) => {
  const apiKey = req.headers['x-rapidapi-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'Missing RapidAPI Key' });
  }

  // (Optional) You could validate apiKey format here if needed
  next();
});

// ✅ MAIN ROUTE EXAMPLE
app.get('/', (req, res) => {
  res.send('TikTok Scraper API is live!');
});

// ✅ ADD YOUR OTHER ROUTES BELOW (example /fetch)
app.get('/fetch', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ message: 'Missing URL' });
  }

  try {
    const response = await axios.get(url);
    res.json({ data: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching URL', error: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
