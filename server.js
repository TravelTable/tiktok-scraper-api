const express = require('express');
const app = express();
const { getXbogus } = require('./xbogus');

app.use(express.json());

app.post('/generate-xbogus', (req, res) => {
    const { url, userAgent } = req.body;
    if (!url || !userAgent) {
        return res.status(400).json({ error: 'Missing url or userAgent' });
    }
    const xbogus = getXbogus(url, userAgent);
    res.json({ xbogus });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));