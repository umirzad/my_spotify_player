const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const myCache = new NodeCache({ stdTTL: 3600 });

app.use(cors());

// ANAHTARIN BAŞINDA VE SONUNDA TEK TIRNAK OLDUĞUNDAN EMİN OL
const YOUTUBE_API_KEY = 'AIzaSyDbxxQwVkdKAXGaRB1x_DKYGjJu6s1Mwf4'; 

app.get('/', (req, res) => res.send("Sunucu Ayakta! 🚀"));

app.get('/search-with-images', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        const cached = myCache.get(query);
        if (cached) return res.json(cached);

        // AXIOS İSTEĞİ - HATA YAKALAMALI
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                q: query,
                type: 'video',
                maxResults: 10,
                key: YOUTUBE_API_KEY
            }
        });

        const tracks = response.data.items.map(item => ({
            name: item.snippet.title,
            artist: item.snippet.channelTitle,
            youtubeThumb: item.snippet.thumbnails.high.url,
            videoId: item.id.videoId
        }));

        myCache.set(query, tracks);
        res.json(tracks);

    } catch (err) {
        // Hata olduğunda boş liste dön ki Frontend patlamasın!
        console.error("DETAYLI HATA:", err.response ? err.response.data : err.message);
        res.status(500).json([]); // Burayı [] yaptık ki .map() hata vermesin
    }
});

// PLAY ROTASI
app.get('/play', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json({});

        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'id',
                q: query,
                type: 'video',
                maxResults: 1,
                key: YOUTUBE_API_KEY
            }
        });

        if (response.data.items && response.data.items.length > 0) {
            res.json({ id: response.data.items[0].id.videoId });
        } else {
            res.json({});
        }
    } catch (err) {
        res.status(500).json({});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu aktif!`));