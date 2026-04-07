<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo" @click="goHome">
        <h2>umirza 🎶</h2>
      </div>

      <nav class="menu">
        <div class="menu-item" :class="{ active: !playlistStore.selectedPlaylist }" @click="goHome">
          🏠 Ana Sayfa
        </div>
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
            :class="{ active: playlistStore.selectedPlaylist?._id === pl._id }"
            @click="playlistStore.selectPlaylist(pl)"
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
        <SearchBar @search="handleSearch" />
      </header>

      <div class="content-body">
        <div v-if="playlistStore.selectedPlaylist" class="playlist-view">
          <div class="playlist-header-info">
            <h1>{{ playlistStore.selectedPlaylist.name }}</h1>
            <p>{{ playlistStore.selectedPlaylist.tracks?.length || 0 }} şarkı</p>
          </div>
          <TrackList 
            :tracks="playlistStore.selectedPlaylist.tracks" 
            @play="handlePlay" 
          />
        </div>

        <div v-else>
          <div v-if="loading" class="status">Şarkılar aranıyor...</div>
          <TrackList 
            v-else 
            :tracks="results" 
            @play="handlePlay" 
          />
        </div>
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
import { usePlaylistStore } from '../stores/playlist';

const router = useRouter();
const { results, loading, search } = useMusic();
const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();

const userEmail = ref('');
const userData = JSON.parse(localStorage.getItem('userData'));

onMounted(() => {
  if (userData) {
    userEmail.value = userData.email;
    playlistStore.fetchPlaylists(userData.id);
  } else {
    router.push('/login');
  }
});

// Arama yapıldığında playlist görünümünden çıkıp arama sonuçlarına dön
const handleSearch = (query) => {
  playlistStore.clearSelection();
  search(query);
};

// Ana sayfa logosuna veya ismine basınca playlisti kapat
const goHome = () => {
  playlistStore.clearSelection();
};

const handleCreate = async () => {
  const name = prompt("Yeni çalma listesi adı:");
  if (name && userData?.id) {
    await playlistStore.createPlaylist(userData.id, name);
  }
};

const handlePlay = (track) => {
  playerStore.setTrack(track);
};

// Çalma listesi sırası (Next/Prev) için Store'u güncelle
watch([results, () => playlistStore.selectedPlaylist], () => {
  if (playlistStore.selectedPlaylist) {
    playerStore.setTracks(playlistStore.selectedPlaylist.tracks);
  } else {
    playerStore.setTracks(results.value);
  }
});

const handleLogout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  router.push('/login');
};
</script>

<style scoped>
/* Mevcut stillerine ek olarak şunları güncelle/ekle */
.app-layout { display: flex; height: 100vh; overflow: hidden; background-color: #000; }
.sidebar { width: 260px; background-color: #000; display: flex; flex-direction: column; padding: 12px; gap: 10px; flex-shrink: 0; }
.menu { background: #121212; border-radius: 8px; padding: 10px; }
.menu-item { padding: 12px; color: #b3b3b3; font-weight: bold; cursor: pointer; transition: 0.3s; }
.menu-item.active, .menu-item:hover { color: white; }
.library { flex: 1; background: #121212; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; overflow: hidden; }
.playlist-item { padding: 12px; color: #b3b3b3; cursor: pointer; border-radius: 6px; transition: 0.2s; }
.playlist-item.active { background: #282828; color: white; }
.playlist-item:hover { color: white; }

.main-content { flex: 1; background: linear-gradient(to bottom, #222222, #121212); margin: 8px 8px 8px 0; border-radius: 8px; display: flex; flex-direction: column; overflow-y: auto; }

/* Playlist Başlık Kısmı */
.playlist-header-info {
  padding: 40px 0 20px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.playlist-header-info h1 { font-size: 3.5rem; margin: 0; color: white; }
.playlist-header-info p { color: #b3b3b3; font-weight: bold; margin-top: 10px; }
</style>