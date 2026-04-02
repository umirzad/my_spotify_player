const express = require('express');
const cors = require('cors');
const yts = require('yt-search');
const app = express();

app.use(cors());

// Arama yaparken resimleri ve video ID'lerini de bulan rota
app.get('/search-with-images', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);
    try {
        const result = await yts(query);
        const tracks = result.videos.slice(0, 20).map(v => ({
            name: v.title,
            artist: v.author.name,
            youtubeThumb: v.thumbnail,
            url: v.url,
            videoId: v.videoId // Müziğin çalması için bu ID şart!
        }));
        res.json(tracks);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Tekil çalma rotası (Gerekirse diye tutuyoruz)
app.get('/play', async (req, res) => {
    const query = req.query.q;
    try {
        const result = await yts(query);
        const video = result.videos[0];
        if (video) {
            res.json({ id: video.videoId, thumbnail: video.thumbnail });
        } else {
            res.status(404).send("Bulunamadı");
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(3000, () => console.log("Sunucu 3000 portunda çalışıyor..."));