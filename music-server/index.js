const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Yeni eklendi
const jwt = require('jsonwebtoken'); // Yeni eklendi

const app = express();
const myCache = new NodeCache({ stdTTL: 3600 });

// MIDDLEWARE (SIRALAMA ÖNEMLİ)
app.use(cors());
app.use(express.json()); // Frontend'den gelen JSON verilerini okumak için ŞART!

// MONGODB BAĞLANTISI
const mongoURI = "mongodb+srv://ubeydmirzad_db_user:QHHnFpKDkDYQt2cZ@umirza.ya2e3sm.mongodb.net/muzik_veritabani?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("Mongo Db bağlantısı başarılı ✅"))
    .catch((err) => console.log("Mogo db bağlantı hatası ❌", err));

// KULLANICI MODELİ (SCHEMA)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    playlists: [{
        name: String,
        tracks: Array
    }]
});
const User = mongoose.model('User', userSchema);

// YOUTUBE API ANAHTARI
const YOUTUBE_API_KEY = "AIzaSyDbxxQwVkdKAXGaRB1x_DKYGJjU6s1Mwf4"; 

// --- ROTARLAR ---

app.get('/', (req, res) => res.send("Sunucu Ayakta! 🚀"));

// 1. KAYIT OLMA (REGISTER)
app.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "Bu email zaten kayıtlı!" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, playlists: [] });
        await newUser.save();

        res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu! ✅" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. GİRİŞ YAPMA (LOGIN)
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Geçersiz şifre!" });

        // JWT Token oluştur (Gizli anahtar: 'spotify_gizli_key')
        const token = jwt.sign({ id: user._id }, 'spotify_gizli_key', { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user._id, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// MEVCUT ARAMA VE OYNATMA ROTARLARI (AYNEN KALSIN)
app.get('/search-with-images', async (req, res) => {
    // ... senin mevcut kodun ...
    try {
        const query = req.query.q;
        if (!query) return res.json([]);
        const cached = myCache.get(query);
        if (cached) return res.json(cached);
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: { part: 'snippet', q: query, type: 'video', maxResults: 10, key: YOUTUBE_API_KEY }
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
        res.status(500).json([]);
    }
});

app.get('/play', async (req, res) => {
    // ... senin mevcut kodun ...
    try {
        const query = req.query.q;
        if (!query) return res.json({});
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: { part: 'id', q: query, type: 'video', maxResults: 1, key: YOUTUBE_API_KEY }
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