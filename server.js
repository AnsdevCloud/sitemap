require('dotenv').config();  // Load environment variables

const express = require('express');
const cors = require('cors');
const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Sample URLs for sitemap, using the dynamic HOST
const defaulturls = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
    { url: '/contact', changefreq: 'monthly', priority: 0.7 },
];


// POST API to generate sitemap dynamically from request body
app.post('/sitemap.xml', async (req, res) => {
    try {
        const { host, urls } = req.body;  // Get HOST and URLs from the request body

        // Validate if HOST and URLs are provided
        if (!host) {
            return res.status(400).json({ error: 'Invalid or missing host URL or URLs array' });
        }

        const stream = new SitemapStream({ hostname: host });
        const xml = await streamToPromise(Readable.from(urls || defaulturls).pipe(stream));

        res.header('Content-Type', 'application/xml');
        res.send(xml.toString());
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate sitemap' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
