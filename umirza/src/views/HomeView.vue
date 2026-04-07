<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo" @click="router.push('/')">
        <h2>umirza 🎶</h2>
      </div>

      <nav class="menu">
        <div class="menu-item active">🏠 Ana Sayfa</div>
        <div class="menu-item">🔍 Ara</div>
      </nav>

      <div class="library">
        <div class="library-header">
          <span>📚 Kitaplığın</span>
          <button @click="handleCreate" class="add-btn" title="Liste Oluştur">+</button>
        </div>
        
        <div class="playlist-list">
          <div v-if="playlistStore.loading" class="pl-status">Yükleniyor...</div>
          <div v-else-if="playlistStore.playlists.length === 0" class="empty-pl">Henüz liste yok</div>
          
          <div 
            v-for="pl in playlistStore.playlists" 
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
        <div v-if="loading" class="status">Şarkılar aranıyor...</div>
        
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
import { usePlaylistStore } from '../stores/playlist'; // Playlist Store eklendi

const router = useRouter();
const { results, loading, search } = useMusic();
const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore(); // Store'u tanımla

const userEmail = ref('');
const userData = JSON.parse(localStorage.getItem('userData'));

onMounted(() => {
  if (userData) {
    userEmail.value = userData.email;
    // Sayfa açıldığında playlistleri Store üzerinden çek
    playlistStore.fetchPlaylists(userData.id);
  } else {
    router.push('/login');
  }
});

const handleCreate = async () => {
  const name = prompt("Yeni çalma listesi adı:");
  if (name && userData?.id) {
    const success = await playlistStore.createPlaylist(userData.id, name);
    if (!success) alert("Liste oluşturulurken bir sorun çıktı.");
  }
};

const handlePlay = (track) => {
  playerStore.setTrack(track);
};

// Arama sonuçları değiştikçe Store'daki listeyi güncelle (Sonraki/Önceki şarkı için)
watch(results, (newResults) => {
  playerStore.setTracks(newResults);
});

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
  overflow: hidden;
  background-color: #000;
}

/* SIDEBAR STİLLERİ */
.sidebar {
  width: 260px;
  background-color: #000;
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 10px;
  flex-shrink: 0;
}

.logo h2 {
  color: #1db954;
  padding: 10px;
  margin: 0;
  cursor: pointer;
}

.menu {
  background: #121212;
  border-radius: 8px;
  padding: 10px;
}

.menu-item {
  padding: 12px;
  color: #b3b3b3;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
}

.menu-item:hover, .menu-item.active {
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
  margin-bottom: 20px;
}

.add-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 1.6rem;
  cursor: pointer;
  line-height: 1;
}

.add-btn:hover { color: white; transform: scale(1.1); }

.playlist-list {
  overflow-y: auto;
  flex: 1;
}

.playlist-item {
  padding: 12px;
  color: #b3b3b3;
  font-size: 0.95rem;
  cursor: pointer;
  border-radius: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-item:hover {
  background: #282828;
  color: white;
}

.pl-status, .empty-pl {
  color: #727272;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 20px;
}

/* PROFİL KART */
.user-profile {
  background: #121212;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 42px;
  height: 42px;
  background: #1db954;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.email { font-size: 0.9rem; font-weight: bold; color: white; }

.logout-link {
  background: none;
  border: none;
  color: #b3b3b3;
  font-size: 0.75rem;
  text-align: left;
  padding: 0;
  cursor: pointer;
  margin-top: 4px;
}

.logout-link:hover { text-decoration: underline; color: white; }

/* ANA İÇERİK */
.main-content {
  flex: 1;
  background: linear-gradient(to bottom, #222222, #121212);
  margin: 8px 8px 8px 0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.top-bar {
  padding: 20px 32px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(18, 18, 18, 0.7);
  backdrop-filter: blur(15px);
}

.content-body {
  padding: 0 32px 32px 32px;
}

.status {
  text-align: center;
  margin-top: 80px;
  color: #1db954;
  font-size: 1.1rem;
}

/* Scrollbar */
::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #444; border-radius: 5px; }
::-webkit-scrollbar-thumb:hover { background: #666; }
</style>