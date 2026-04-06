const express = require('express');
const cors = require('cors');
const yts = require('yt-search');
const NodeCache = require('node-cache');

const app = express();
// stdTTL: 600 (10 dakika tutar), checkperiod: 120 (temizlik süresi)
const myCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

app.use(cors());

app.get('/', (req, res) => res.send("Sunucu Aktif! 🚀"));

app.get('/search-with-images', async (req, res) => {
    // Sorguyu temizle (boşlukları sil ve küçük harfe çevir ki 'Tarkan' ile 'tarkan' aynı olsun)
    const rawQuery = req.query.q;
    if (!rawQuery) return res.json([]);
    const query = rawQuery.trim().toLowerCase();

    // 1. CACHE KONTROLÜ
    const cachedResult = myCache.get(query);
    if (cachedResult) {
        console.log(`>>> CACHE HIT (Hafızadan Geldi): ${query}`);
        return res.json(cachedResult);
    }

    console.log(`>>> CACHE MISS (YouTube'a Gidiliyor): ${query}`);

    try {
        const result = await yts({ query, hl: 'tr', gl: 'TR' });
        const videos = result.videos.slice(0, 10); // 12 yerine 10 yaparak hızı biraz daha zorladık

        const tracks = videos.map(v => ({
            name: v.title,
            artist: v.author.name,
            youtubeThumb: v.thumbnail,
            videoId: v.videoId,
            duration: v.timestamp
        }));

        // 2. CACHE'E KAYDET
        myCache.set(query, tracks);
        res.json(tracks);

    } catch (err) {
        console.error("Arama Hatası:", err.message);
        res.status(500).json({ error: "Arama başarısız" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif`));