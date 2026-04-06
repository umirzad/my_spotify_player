const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const myCache = new NodeCache({ stdTTL: 3600 });

app.use(cors());

const YOUTUBE_API_KEY = 'AIzaSyDbxxQwVkdKAXGaRB1x_DKYGjJu6s1Mwf4'; // Anahtarın burada kalsın

app.get('/', (req, res) => res.send("YouTube API Sunucusu Aktif! 🚀"));

// 1. ARAMA ROTASI
app.get('/search-with-images', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);
    const cleanQuery = query.trim().toLowerCase();

    const cached = myCache.get(cleanQuery);
    if (cached) return res.json(cached);

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: cleanQuery,
                type: 'video',
                maxResults: 10,
                videoCategoryId: '10',
                key: YOUTUBE_API_KEY
            }
        });

        const tracks = response.data.items.map(item => ({
            name: item.snippet.title,
            artist: item.snippet.channelTitle,
            youtubeThumb: item.snippet.thumbnails.high.url,
            videoId: item.id.videoId
        }));

        myCache.set(cleanQuery, tracks);
        res.json(tracks);
    } catch (err) {
        res.status(500).json({ error: "Arama hatası" });
    }
});

// 2. ÇALMA ROTASI (EKSİK OLAN KISIM BURASIYDI!)
app.get('/play', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json({});

    try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'id',
                q: query,
                type: 'video',
                maxResults: 1,
                key: YOUTUBE_API_KEY
            }
        });

        if (response.data.items.length > 0) {
            res.json({ id: response.data.items[0].id.videoId });
        } else {
            res.status(404).json({ error: "Video bulunamadı" });
        }
    } catch (err) {
        res.status(500).json({ error: "Çalma hatası" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif`));