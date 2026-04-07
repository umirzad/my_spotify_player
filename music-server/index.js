const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 

const app = express();
const myCache = new NodeCache({ stdTTL: 3600 });

// MIDDLEWARE
app.use(cors());
app.use(express.json()); 

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
        name: { type: String, required: true },
        tracks: { type: Array, default: [] }
    }]
});
const User = mongoose.model('User', userSchema);

const YOUTUBE_API_KEY = "AIzaSyDbxxQwVkdKAXGaRB1x_DKYGJjU6s1Mwf4"; 

// --- ROTALAR ---

app.get('/', (req, res) => res.send("Sunucu Ayakta! 🚀"));

// 1. KAYIT OLMA
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

// 2. GİRİŞ YAPMA
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Geçersiz şifre!" });

        const token = jwt.sign({ id: user._id }, 'spotify_gizli_key', { expiresIn: '7d' });

        res.json({
            token,
            user: { id: user._id, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. TÜM PLAYLISTLERİ GETİR (YENİ!)
app.get('/get-playlists/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        res.json(user.playlists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. BOŞ PLAYLIST OLUŞTUR (YENİ!)
app.post('/create-playlist', async (req, res) => {
    try {
        const { userId, playlistName } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        // Liste zaten var mı kontrolü
        const exists = user.playlists.find(p => p.name === playlistName);
        if (exists) return res.status(400).json({ message: "Bu isimde bir liste zaten var!" });

        user.playlists.push({ name: playlistName, tracks: [] });
        await user.save();

        res.status(201).json(user.playlists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. PLAYLIST'E ŞARKI EKLE (GÜNCELLENDİ!)
app.post('/add-to-playlist', async (req, res) => {
    try {
        const { userId, playlistName, track } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });

        const playlist = user.playlists.find(p => p.name === playlistName);
        if (!playlist) return res.status(404).json({ message: "Liste bulunamadı" });

        // Şarkı zaten listede var mı?
        const isExist = playlist.tracks.some(t => t.videoId === track.videoId);
        if (isExist) return res.status(400).json({ message: "Bu şarkı zaten listede var!" });

        playlist.tracks.push(track);
        await user.save();
        res.json({ message: "Şarkı eklendi! 🎶" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ARAMA VE OYNATMA ROTARLARI (AYNEN KALSIN)
app.get('/search-with-images', async (req, res) => {
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
    } catch (err) { res.status(500).json([]); }
});

app.get('/play', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json({});
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: { part: 'id', q: query, type: 'video', maxResults: 1, key: YOUTUBE_API_KEY }
        });
        if (response.data.items && response.data.items.length > 0) {
            res.json({ id: response.data.items[0].id.videoId });
        } else { res.json({}); }
    } catch (err) { res.status(500).json({}); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu aktif!`));