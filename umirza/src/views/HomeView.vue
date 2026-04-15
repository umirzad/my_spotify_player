<template>
  <div class="app-shell">
    <Toast />
    <ConfirmDialog />
    <Dialog v-model:visible="showCreateDialog" modal header="Yeni playlist" :style="{ width: '28rem' }">
      <div class="dialog-field">
        <label for="playlistName">Playlist adi</label>
        <InputText id="playlistName" v-model="newPlaylistName" autocomplete="off" />
      </div>
      <template #footer>
        <Button label="Vazgec" severity="secondary" text @click="showCreateDialog = false" />
        <Button label="Olustur" @click="submitCreatePlaylist" />
      </template>
    </Dialog>

    <Dialog v-model:visible="showRenameDialog" modal header="Playlist duzenle" :style="{ width: '28rem' }">
      <div class="dialog-field">
        <label for="renamePlaylist">Yeni ad</label>
        <InputText id="renamePlaylist" v-model="renamePlaylistName" autocomplete="off" />
      </div>
      <template #footer>
        <Button label="Vazgec" severity="secondary" text @click="showRenameDialog = false" />
        <Button label="Kaydet" @click="submitRenamePlaylist" />
      </template>
    </Dialog>

    <main class="main-content">
      <header class="top-userbar">
        <div class="user-pill">
          <span class="avatar">{{ displayName.charAt(0).toUpperCase() }}</span>
          <span>@{{ displayName }}</span>
        </div>
        <Button label="Cikis yap" severity="secondary" outlined @click="askLogoutConfirm" />
      </header>

      <section v-if="activeTab === 'home'" class="view">
        <header class="hero-card">
          <div>
            <p class="hero-subtitle">Hos geldin</p>
            <h1>{{ displayName }}</h1>
            <p class="hero-meta">{{ playlistStore.playlists.length }} playlist • {{ totalTrackCount }} sarki</p>
          </div>
          <div class="hero-actions">
            <button class="ghost-btn" @click="continueListening">Devam et</button>
            <button class="ghost-btn" @click="goTab('library')">Kitapligima git</button>
          </div>
        </header>

        <section class="section-block">
          <div class="section-head">
            <h2>Sana ozel secimler</h2>
            <span>{{ personalizedTracks.length }} sarki</span>
          </div>
          <TrackList :tracks="personalizedTracks" @play="handlePlay" />
          <div v-if="!personalizedTracks.length" class="empty-card">
            Sana ozel oneriler olusturmak icin birkac sarki ara ve dinle.
          </div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <h2>Son dinlenenler</h2>
            <span>{{ playerStore.recentTracks.length }} kayit</span>
          </div>
          <TrackList :tracks="playerStore.recentTracks.slice(0, 8)" @play="handlePlay" />
          <div v-if="!playerStore.recentTracks.length" class="empty-card">Henuz dinleme gecmisi yok.</div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <h2>Begendiklerin</h2>
            <span>{{ playerStore.likedTracks.length }} sarki</span>
          </div>
          <TrackList :tracks="playerStore.likedTracks.slice(0, 8)" @play="handlePlay" />
          <div v-if="!playerStore.likedTracks.length" class="empty-card">Begendiginde burada gorunecek.</div>
        </section>

        <section class="section-block">
          <div class="section-head">
            <h2>Playlistlerin</h2>
            <button class="ghost-btn" @click="goTab('library')">Tumunu gor</button>
          </div>
          <div class="playlist-grid">
            <button
              v-for="pl in playlistStore.playlists.slice(0, 6)"
              :key="pl._id || pl.name"
              class="playlist-card"
              @click="openPlaylist(pl)"
            >
              <strong>{{ pl.name }}</strong>
              <small>{{ pl.tracks?.length || 0 }} sarki</small>
            </button>
            <div v-if="playlistStore.playlists.length === 0" class="empty-card">
              Henuz playlistin yok. Kitapligim sekmesinden olusturabilirsin.
            </div>
          </div>
        </section>
      </section>

      <section v-else-if="activeTab === 'library'" class="view">
        <div class="section-head">
          <h2>Kitapligim</h2>
          <button class="add-btn" @click="handleCreate">+ Playlist olustur</button>
        </div>

        <section class="section-block">
          <div class="library-tools">
            <input v-model="libraryQuery" placeholder="Playlist ara..." class="library-input">
            <select v-model="librarySort" class="library-select">
              <option value="recent">En son guncellenen</option>
              <option value="name-asc">Isme gore A-Z</option>
              <option value="name-desc">Isme gore Z-A</option>
              <option value="tracks-desc">En cok sarki</option>
            </select>
          </div>
        </section>

        <div class="library-layout">
          <div class="playlist-list-panel">
            <div v-if="playlistStore.loading" class="status">
              <Skeleton width="100%" height="2.2rem" class="mb" />
              <Skeleton width="100%" height="2.2rem" class="mb" />
              <Skeleton width="100%" height="2.2rem" />
            </div>
            <button
              v-for="pl in filteredSortedPlaylists"
              :key="pl._id || pl.name"
              class="playlist-row"
              :class="{ active: playlistStore.selectedPlaylist?._id === pl._id }"
              @click="playlistStore.selectPlaylist(pl)"
            >
              <span>{{ pl.name }}</span>
              <small>{{ pl.tracks?.length || 0 }}</small>
            </button>
            <div v-if="!playlistStore.loading && filteredSortedPlaylists.length === 0" class="status">
              Filtreye uygun playlist yok.
            </div>
          </div>

          <div class="playlist-detail">
            <div v-if="playlistStore.selectedPlaylist" class="playlist-header-info">
              <div>
                <h3>{{ playlistStore.selectedPlaylist.name }}</h3>
                <p>{{ playlistStore.selectedPlaylist.tracks?.length || 0 }} sarki</p>
              </div>
              <div class="playlist-actions">
                <Button label="Duzenle" size="small" severity="secondary" @click="openRenameDialog" />
                <Button label="Sil" size="small" severity="danger" outlined @click="askDeletePlaylist" />
              </div>
            </div>
            <TrackList
              v-if="playlistStore.selectedPlaylist"
              :tracks="playlistStore.selectedPlaylist.tracks"
              @play="handlePlay"
            />
            <div v-else class="status">Soldan bir playlist sec.</div>
          </div>
        </div>
      </section>

      <section v-else class="view">
        <div class="section-head">
          <h2>Arama</h2>
        </div>
        <SearchBar @search="handleSearch" />
        <div v-if="loading" class="status">
          <Skeleton width="100%" height="3.5rem" class="mb" />
          <Skeleton width="100%" height="3.5rem" class="mb" />
          <Skeleton width="100%" height="3.5rem" />
        </div>
        <div v-else-if="error" class="empty-card">
          <p>{{ error }}</p>
          <Button label="Tekrar dene" size="small" @click="retrySearch" />
        </div>
        <div v-else-if="lastQuery && !results.length" class="empty-card">
          Sonuc bulunamadi. Baska bir anahtar kelime dene.
        </div>
        <TrackList v-else :tracks="results" @play="handlePlay" />
      </section>

      <section class="section-block queue-box">
        <div class="section-head">
          <h2>Sirada calacaklar</h2>
          <span>{{ nextUpTracks.length }} sarki</span>
        </div>
        <TrackList :tracks="nextUpTracks.slice(0, 5)" @play="handlePlay" />
        <div v-if="!nextUpTracks.length" class="empty-card">Kuyruk bos. Arama yapip sarki oynat.</div>
      </section>
    </main>

    <footer class="bottom-nav">
      <button :class="{ active: activeTab === 'home' }" @click="goTab('home')">Ana Sayfa</button>
      <button :class="{ active: activeTab === 'library' }" @click="goTab('library')">Kitapligim</button>
      <button :class="{ active: activeTab === 'search' }" @click="goTab('search')">Arama</button>
    </footer>

    <PlayerBar
      :track="playerStore.currentTrack"
      :isPlaying="playerStore.isPlaying"
      :currentTime="playerStore.currentTime"
      :duration="playerStore.duration"
      :volume="playerStore.volume"
      :isReplay="playerStore.isReplay"
      :isShuffle="playerStore.isShuffle"
      :isLiked="playerStore.isLiked(playerStore.currentTrack)"
      @toggle="playerStore.togglePlay"
      @seek="playerStore.seekTo"
      @volumeChange="playerStore.setVolume"
      @toggleReplay="playerStore.toggleReplay"
      @toggleShuffle="playerStore.toggleShuffle"
      @toggleLike="playerStore.toggleLike(playerStore.currentTrack)"
      @prev="playerStore.playPreviousTrack"
      @next="playerStore.playNextTrack"
    />

    <div id="youtube-player" style="display: none;"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import Skeleton from 'primevue/skeleton';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import SearchBar from '../components/searchBar.vue';
import TrackList from '../components/trackList.vue';
import PlayerBar from '../components/playerBar.vue';
import { useMusic } from '../composables/useMusic';
import { usePlayerStore } from '../stores/player';
import { usePlaylistStore } from '../stores/playlist';
import { getUserData } from '../utils/auth';

const router = useRouter();
const { results, loading, error, lastQuery, search, retrySearch } = useMusic();
const playerStore = usePlayerStore();
const playlistStore = usePlaylistStore();
const confirm = useConfirm();
const toast = useToast();

const activeTab = ref('home');
const userData = getUserData();
const showCreateDialog = ref(false);
const newPlaylistName = ref('');
const showRenameDialog = ref(false);
const renamePlaylistName = ref('');
const libraryQuery = ref('');
const librarySort = ref('recent');

const displayName = computed(() => {
  const email = userData?.email || '';
  return email ? email.split('@')[0] : 'muziksever';
});

const totalTrackCount = computed(() =>
  playlistStore.playlists.reduce((total, pl) => total + (pl.tracks?.length || 0), 0),
);

const personalizedTracks = computed(() => {
  const map = new Map();
  playlistStore.playlists.forEach((pl) => {
    (pl.tracks || []).forEach((track) => {
      const key = track.videoId || `${track.artist}-${track.name}`;
      if (!map.has(key)) map.set(key, track);
    });
  });
  return Array.from(map.values()).slice(0, 12);
});

const filteredSortedPlaylists = computed(() => {
  const q = libraryQuery.value.trim().toLowerCase();
  const list = playlistStore.playlists.filter((pl) =>
    !q || (pl.name || '').toLowerCase().includes(q),
  );

  return [...list].sort((a, b) => {
    if (librarySort.value === 'name-asc') return (a.name || '').localeCompare(b.name || '');
    if (librarySort.value === 'name-desc') return (b.name || '').localeCompare(a.name || '');
    if (librarySort.value === 'tracks-desc') return (b.tracks?.length || 0) - (a.tracks?.length || 0);
    return 0;
  });
});

const nextUpTracks = computed(() => {
  if (!playerStore.currentTrack || !playerStore.allTracks.length) return [];
  const currentIndex = playerStore.allTracks.findIndex((track) =>
    track.videoId && playerStore.currentTrack.videoId
      ? track.videoId === playerStore.currentTrack.videoId
      : (track.name || track.title) === (playerStore.currentTrack.name || playerStore.currentTrack.title),
  );
  if (currentIndex === -1) return playerStore.allTracks.slice(0, 5);
  return [...playerStore.allTracks.slice(currentIndex + 1), ...playerStore.allTracks.slice(0, currentIndex)];
});

onMounted(async () => {
  if (!userData?.id) {
    router.push('/login');
    return;
  }
  playerStore.hydrateFromStorage();
  await playlistStore.fetchPlaylists(userData.id);
  if (playlistStore.playlists.length > 0) {
    playlistStore.selectPlaylist(playlistStore.playlists[0]);
  }
});

const goTab = (tab) => {
  activeTab.value = tab;
  if (tab !== 'library') {
    playlistStore.clearSelection();
  } else if (!playlistStore.selectedPlaylist && playlistStore.playlists.length > 0) {
    playlistStore.selectPlaylist(playlistStore.playlists[0]);
  }
};

const openPlaylist = (playlist) => {
  activeTab.value = 'library';
  playlistStore.selectPlaylist(playlist);
};

const handleSearch = (query) => {
  activeTab.value = 'search';
  playlistStore.clearSelection();
  search(query);
};

const continueListening = () => {
  if (playerStore.currentTrack) {
    playerStore.setTrack(playerStore.currentTrack);
    return;
  }
  if (playerStore.recentTracks.length > 0) {
    playerStore.setTrack(playerStore.recentTracks[0]);
    return;
  }
  toast.add({ severity: 'info', summary: 'Bilgi', detail: 'Devam etmek icin once bir sarki ac.', life: 2200 });
};

const handleCreate = () => {
  newPlaylistName.value = '';
  showCreateDialog.value = true;
};

const submitCreatePlaylist = async () => {
  const name = newPlaylistName.value.trim();
  if (!name || !userData?.id) return;
  const ok = await playlistStore.createPlaylist(userData.id, name);
  if (ok) {
    showCreateDialog.value = false;
    toast.add({ severity: 'success', summary: 'Basarili', detail: 'Playlist olusturuldu.', life: 2500 });
  } else {
    toast.add({ severity: 'error', summary: 'Hata', detail: 'Playlist olusturulamadi.', life: 2500 });
  }
};

const openRenameDialog = () => {
  if (!playlistStore.selectedPlaylist) return;
  renamePlaylistName.value = playlistStore.selectedPlaylist.name || '';
  showRenameDialog.value = true;
};

const submitRenamePlaylist = async () => {
  const selected = playlistStore.selectedPlaylist;
  if (!selected || !userData?.id) return;
  const newName = renamePlaylistName.value.trim();
  const ok = await playlistStore.renamePlaylist(userData.id, selected.name, newName);
  if (ok) {
    showRenameDialog.value = false;
    toast.add({ severity: 'success', summary: 'Guncellendi', detail: 'Playlist adi degisti.', life: 2500 });
  } else {
    toast.add({ severity: 'warn', summary: 'Bilgi', detail: 'Playlist adi degistirilemedi.', life: 2500 });
  }
};

const askDeletePlaylist = () => {
  const selected = playlistStore.selectedPlaylist;
  if (!selected || !userData?.id) return;

  confirm.require({
    message: `"${selected.name}" playlistini silmek istiyor musun?`,
    header: 'Silme onayi',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Vazgec', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Sil', severity: 'danger' },
    accept: async () => {
      const ok = await playlistStore.deletePlaylist(userData.id, selected.name);
      if (ok) {
        toast.add({ severity: 'success', summary: 'Silindi', detail: 'Playlist silindi.', life: 2500 });
      } else {
        toast.add({ severity: 'error', summary: 'Hata', detail: 'Playlist silinemedi.', life: 2500 });
      }
    },
  });
};

const handlePlay = (track) => {
  playerStore.setTrack(track);
};

watch([results, () => playlistStore.selectedPlaylist, activeTab, personalizedTracks], () => {
  if (activeTab.value === 'library' && playlistStore.selectedPlaylist) {
    playerStore.setTracks(playlistStore.selectedPlaylist.tracks || []);
    return;
  }
  if (activeTab.value === 'search') {
    playerStore.setTracks(results.value || []);
    return;
  }
  playerStore.setTracks(personalizedTracks.value || []);
});

const handleLogout = () => {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userData');
  router.push('/login');
};

const askLogoutConfirm = () => {
  confirm.require({
    message: 'Cikis yapmak istiyor musun?',
    header: 'Oturumu kapat',
    icon: 'pi pi-sign-out',
    rejectProps: { label: 'Vazgec', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Cikis', severity: 'danger' },
    accept: handleLogout,
  });
};
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  color: #fff;
  padding-bottom: 164px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 16px 0;
}

.top-userbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1c1c1c;
  border: 1px solid #2b2b2b;
  border-radius: 999px;
  padding: 6px 12px;
}

.avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1db954;
  color: #111;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.view {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.hero-card {
  background: linear-gradient(135deg, #1db954 0%, #0c5f2f 100%);
  border-radius: 16px;
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-actions {
  display: flex;
  gap: 8px;
}

.hero-card h1 {
  margin: 0;
  font-size: 2rem;
}

.hero-subtitle,
.hero-meta {
  margin: 0;
  opacity: 0.92;
}

.section-block {
  background: #181818;
  border-radius: 14px;
  padding: 14px;
}

.queue-box {
  margin-bottom: 10px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.section-head h2 {
  margin: 0;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}

.playlist-card {
  background: #242424;
  border: 1px solid #2f2f2f;
  color: #fff;
  border-radius: 10px;
  padding: 12px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.playlist-card:hover {
  border-color: #1db954;
}

.empty-card,
.status {
  color: #b3b3b3;
  padding: 10px;
}

.mb {
  margin-bottom: 8px;
}

.library-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 14px;
}

.library-tools {
  display: flex;
  gap: 10px;
}

.library-input,
.library-select {
  background: #202020;
  color: #fff;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px 10px;
}

.library-input {
  flex: 1;
}

.playlist-list-panel,
.playlist-detail {
  background: #181818;
  border-radius: 12px;
  padding: 10px;
}

.playlist-row {
  width: 100%;
  background: transparent;
  border: 0;
  color: #d1d1d1;
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}

.playlist-row.active,
.playlist-row:hover {
  background: #2a2a2a;
  color: #fff;
}

.playlist-header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #2f2f2f;
  margin-bottom: 10px;
  padding: 8px;
}

.playlist-header-info h3,
.playlist-header-info p {
  margin: 0;
}

.playlist-actions {
  display: flex;
  gap: 8px;
}

.ghost-btn,
.add-btn,
.edit-btn,
.delete-btn {
  background: #2a2a2a;
  border: 1px solid #3a3a3a;
  color: #fff;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
}

.delete-btn {
  border-color: #5c2d3f;
}

.dialog-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 90px;
  height: 60px;
  background: #121212;
  border-top: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 999;
}

.bottom-nav button {
  background: transparent;
  border: 0;
  color: #b3b3b3;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 999px;
}

.bottom-nav button.active {
  background: #1db954;
  color: #111;
}

.bottom-nav .logout {
  color: #f18f8f;
}

@media (max-width: 900px) {
  .library-layout {
    grid-template-columns: 1fr;
  }

  .hero-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>