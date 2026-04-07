<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo">
        <h2 @click="router.push('/')">umirza 🎶</h2>
      </div>

      <nav class="menu">
        <div class="menu-item active">🏠 Ana Sayfa</div>
        <div class="menu-item">🔍 Ara</div>
      </nav>

      <div class="library">
        <div class="library-header">
          <span>📚 Kitaplığın</span>
          <button @click="handleCreatePlaylist" class="add-btn" title="Liste Oluştur">+</button>
        </div>
        
        <div class="playlist-list">
          <div v-if="userPlaylists.length === 0" class="empty-pl">Henüz liste yok</div>
          <div 
            v-for="pl in userPlaylists" 
            :key="pl._id" 
            class="playlist-item"
          >
            {{ pl.name }}
          </div>
        </div>
      </div>

      <div class="user-profile">
        <div class="avatar">{{ userEmail[0]?.toUpperCase() || 'U' }}</div>
        <div class="user-info">
          <span class="email">{{ userEmail.split('@')[0] }}</span>
          <button @click="handleLogout" class="logout-link">Çıkış yap</button>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <SearchBar @search="search" />
      </header>

      <div class="content-body">
        <div v-if="loading" class="status">Şarkılar yükleniyor...</div>
        
        <TrackList 
          v-else 
          :tracks="results" 
          @play="handlePlay" 
        />
      </div>
    </main>

    <PlayerBar 
      :track="playerStore.currentTrack" 
      :isPlaying="playerStore.isPlaying"
      :currentTime="playerStore.currentTime"
      :duration="playerStore.duration"
      :volume="playerStore.volume"
      :isReplay="playerStore.isReplay"
      @toggle="playerStore.togglePlay" 
      @seek="playerStore.seekTo"
      @volumeChange="playerStore.setVolume"
      @toggleReplay="playerStore.toggleReplay"
      @prev="playerStore.playPreviousTrack"
      @next="playerStore.playNextTrack"
      @random="playerStore.playRandomTrack" 
    />

    <div id="youtube-player" style="display: none;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import SearchBar from '../components/searchBar.vue';
import TrackList from '../components/trackList.vue';
import PlayerBar from '../components/playerBar.vue';
import { useMusic } from '../composables/useMusic';
import { usePlayerStore } from '../stores/player';

const router = useRouter();
const { results, loading, search } = useMusic();
const playerStore = usePlayerStore();

const userPlaylists = ref([]);
const userEmail = ref('');

// Kullanıcı bilgilerini ve playlistleri çek
onMounted(async () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (userData) {
    userEmail.value = userData.email;
    await fetchPlaylists(userData.id);
  }
});

const fetchPlaylists = async (userId) => {
  try {
    // Backend'de bu rotayı az önce konuştuk, eklemeyi unutma!
    const res = await fetch(`https://my-spotify-player-tm8k.onrender.com/get-playlists/${userId}`);
    if (res.ok) {
      userPlaylists.value = await res.json();
    }
  } catch (err) {
    console.error("Playlistler yüklenemedi", err);
  }
};

const handleCreatePlaylist = async () => {
  const name = prompt("Yeni çalma listesi adı:");
  if (!name) return;

  const userData = JSON.parse(localStorage.getItem('userData'));
  try {
    const res = await fetch('https://my-spotify-player-tm8k.onrender.com/create-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userData.id, playlistName: name })
    });
    if (res.ok) {
      await fetchPlaylists(userData.id);
    }
  } catch (err) {
    alert("Liste oluşturulamadı.");
  }
};

watch(results, (newResults) => {
  playerStore.setTracks(newResults);
});

const handlePlay = (track) => {
  playerStore.setTrack(track);
};

const handleLogout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  router.push('/login');
};
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden; /* Dışarı taşmayı engelle */
  background-color: #000;
}

/* SIDEBAR STİLLERİ */
.sidebar {
  width: 240px;
  background-color: #000;
  display: flex;
  flex-direction: column;
  padding: 15px;
  gap: 20px;
  flex-shrink: 0;
}

.logo h2 {
  color: #1db954;
  margin: 0 0 10px 10px;
  cursor: pointer;
}

.menu-item {
  padding: 12px;
  color: #b3b3b3;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.menu-item.active, .menu-item:hover {
  color: white;
}

.library {
  flex: 1;
  background: #121212;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #b3b3b3;
  font-weight: bold;
  margin-bottom: 15px;
}

.add-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 1.5rem;
  cursor: pointer;
}

.add-btn:hover { color: white; }

.playlist-list {
  overflow-y: auto;
  flex: 1;
}

.playlist-item {
  padding: 10px;
  color: #b3b3b3;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 4px;
}

.playlist-item:hover {
  background: #282828;
  color: white;
}

/* PROFİL KISMI */
.user-profile {
  background: #121212;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #535353;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.email { font-size: 0.85rem; font-weight: bold; }

.logout-link {
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 0.75rem;
  text-align: left;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
}

/* ANA İÇERİK STİLLERİ */
.main-content {
  flex: 1;
  background: linear-gradient(to bottom, #1e1e1e, #121212);
  margin: 8px 8px 8px 0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.top-bar {
  padding: 15px 30px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(18, 18, 18, 0.5);
  backdrop-filter: blur(10px);
}

.content-body {
  padding: 20px;
}

.status {
  text-align: center;
  margin-top: 50px;
  color: #1db954;
}

/* Kaydırma Çubuğu */
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #555; }
::-webkit-scrollbar-thumb:hover { background: #1db954; }
</style>