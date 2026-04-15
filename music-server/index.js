require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const myCache = new NodeCache({ stdTTL: 3600 });

const {
    MONGO_URI,
    YOUTUBE_API_KEY,
    JWT_SECRET,
    CLIENT_ORIGIN = '*',
    PORT = 3000,
} = process.env;

if (!MONGO_URI || !YOUTUBE_API_KEY || !JWT_SECRET) {
    console.error('Missing env vars: MONGO_URI, YOUTUBE_API_KEY, JWT_SECRET are required.');
    process.exit(1);
}

app.use(cors({
    origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN,
}));
app.use(express.json());

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB baglantisi basarili.'))
    .catch((err) => {
        console.error('MongoDB baglanti hatasi:', err);
        process.exit(1);
    });

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    playlists: [{
        name: { type: String, required: true },
        tracks: { type: Array, default: [] }
    }]
});
const User = mongoose.model('User', userSchema);

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Yetkisiz erisim.' });
    }

    const token = authHeader.slice(7);
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        req.userId = payload.id;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Gecersiz veya suresi dolmus token.' });
    }
};

const findUserAndAuthorize = async (requestedUserId, authUserId) => {
    if (!requestedUserId || String(requestedUserId) !== String(authUserId)) {
        return null;
    }
    return User.findById(requestedUserId);
};

app.get('/', (req, res) => res.send('Sunucu ayakta.'));

app.post('/register', async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        if (!email || !password || password.length < 6) {
            return res.status(400).json({ message: 'Gecerli email ve en az 6 karakter sifre girin.' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Bu email zaten kayitli.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, playlists: [] });
        await newUser.save();
        res.status(201).json({ message: 'Kullanici basariyla olusturuldu.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');
        if (!email || !password) {
            return res.status(400).json({ message: 'Email ve sifre zorunludur.' });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'Kullanici bulunamadi.' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Gecersiz sifre.' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/get-playlists/:userId', authMiddleware, async (req, res) => {
    try {
        const user = await findUserAndAuthorize(req.params.userId, req.userId);
        if (!user) return res.status(403).json({ message: 'Bu kaynaga erisim izniniz yok.' });
        res.json(user.playlists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/create-playlist', authMiddleware, async (req, res) => {
    try {
        const userId = String(req.body.userId || '');
        const playlistName = String(req.body.playlistName || '').trim();
        if (!playlistName) return res.status(400).json({ message: 'Playlist adi zorunludur.' });

        const user = await findUserAndAuthorize(userId, req.userId);
        if (!user) return res.status(403).json({ message: 'Bu islem icin yetkiniz yok.' });

        const exists = user.playlists.find(p => p.name === playlistName);
        if (exists) return res.status(400).json({ message: 'Bu isimde bir liste zaten var.' });

        user.playlists.push({ name: playlistName, tracks: [] });
        await user.save();
        res.status(201).json(user.playlists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/delete-playlist', authMiddleware, async (req, res) => {
    try {
        const userId = String(req.body.userId || '');
        const playlistName = String(req.body.playlistName || '').trim();
        const user = await findUserAndAuthorize(userId, req.userId);
        if (!user) return res.status(403).json({ message: 'Bu islem icin yetkiniz yok.' });

        user.playlists = user.playlists.filter(p => p.name !== playlistName);
        await user.save();
        res.json({ message: 'Playlist silindi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/rename-playlist', authMiddleware, async (req, res) => {
    try {
        const userId = String(req.body.userId || '');
        const oldName = String(req.body.oldName || '').trim();
        const newName = String(req.body.newName || '').trim();
        if (!oldName || !newName) return res.status(400).json({ message: 'Playlist isimleri zorunludur.' });

        const user = await findUserAndAuthorize(userId, req.userId);
        if (!user) return res.status(403).json({ message: 'Bu islem icin yetkiniz yok.' });

        const playlist = user.playlists.find(p => p.name === oldName);
        if (playlist) {
            playlist.name = newName;
            await user.save();
            res.json({ message: 'Playlist adi guncellendi.' });
        } else {
            res.status(404).json({ message: 'Liste bulunamadi.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/add-to-playlist', authMiddleware, async (req, res) => {
    try {
        const userId = String(req.body.userId || '');
        const playlistName = String(req.body.playlistName || '').trim();
        const track = req.body.track || {};
        const user = await findUserAndAuthorize(userId, req.userId);
        if (!user) return res.status(403).json({ message: 'Bu islem icin yetkiniz yok.' });

        const playlist = user.playlists.find(p => p.name === playlistName);
        if (!playlist) return res.status(404).json({ message: 'Liste bulunamadi.' });

        const isExist = playlist.tracks.some(t => t.videoId === track.videoId);
        if (isExist) return res.status(400).json({ message: 'Bu sarki zaten listede var.' });

        playlist.tracks.push(track);
        await user.save();
        res.json({ message: 'Sarki eklendi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/remove-from-playlist', authMiddleware, async (req, res) => {
    try {
        const userId = String(req.body.userId || '');
        const playlistName = String(req.body.playlistName || '').trim();
        const videoId = String(req.body.videoId || '').trim();
        const user = await findUserAndAuthorize(userId, req.userId);
        if (!user) return res.status(403).json({ message: 'Bu islem icin yetkiniz yok.' });

        const playlist = user.playlists.find(p => p.name === playlistName);
        if (!playlist) return res.status(404).json({ message: 'Liste bulunamadi.' });

        playlist.tracks = playlist.tracks.filter(t => t.videoId !== videoId);
        await user.save();
        res.json({ message: 'Sarki silindi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/search-with-images', async (req, res) => {
    try {
        const query = String(req.query.q || '').trim();
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
    try {
        const query = String(req.query.q || '').trim();
        if (!query) return res.status(400).json({ message: 'Arama ifadesi zorunludur.' });
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

app.listen(PORT, () => console.log(`Sunucu aktif!`));