<template>
  <div class="track-list">
    <div v-for="track in tracks" :key="track.videoId" class="track-item">
      <div class="track-main" @click="$emit('play', track)">
        <div class="cover-wrapper">
          <img :src="track.youtubeThumb" class="cover" />
        </div>
        <div class="info">
          <div class="name">{{ track.name }}</div>
          <div class="artist">{{ track.artist }}</div>
        </div>
      </div>

      <div class="actions">
        <button 
          v-if="playlistStore.selectedPlaylist" 
          class="remove-btn" 
          @click.stop="handleRemove(track)"
          title="Listeden Kaldır"
        >
          🗑️
        </button>

        <select 
          v-else
          class="playlist-select" 
          @change="handleSelectChange($event, track)"
          title="Listeye Ekle"
        >
          <option value="" disabled selected>+</option>
          <option 
            v-for="pl in playlistStore.playlists" 
            :key="pl._id" 
            :value="pl.name"
          >
            {{ pl.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlaylistStore } from '../stores/playlist';

defineProps(['tracks']);
const emit = defineEmits(['play']);
const playlistStore = usePlaylistStore();

const handleSelectChange = async (event, track) => {
  const playlistName = event.target.value;
  const userData = JSON.parse(localStorage.getItem('userData'));

  if (!playlistName || !userData?.id) return;

  try {
    const res = await fetch('https://my-spotify-player-tm8k.onrender.com/add-to-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userData.id, playlistName, track })
    });

    if (res.ok) {
      // ANINDA GÜNCELLE: Store'dan verileri tekrar çek
      await playlistStore.fetchPlaylists(userData.id);
      alert("Şarkı eklendi! ✨");
    }
  } catch (err) {
    console.error(err);
  } finally {
    event.target.value = "";
  }
};

const handleRemove = async (track) => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const playlistName = playlistStore.selectedPlaylist.name;

  if (!confirm("Şarkıyı listeden silmek istiyor musunuz?")) return;

  try {
    const res = await fetch('https://my-spotify-player-tm8k.onrender.com/remove-from-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: userData.id, 
        playlistName: playlistName, 
        videoId: track.videoId 
      })
    });

    if (res.ok) {
      // ANINDA GÜNCELLE: Silinen şarkı ekrandan hemen gider
      await playlistStore.fetchPlaylists(userData.id);
    }
  } catch (err) {
    alert("Silinirken bir hata oluştu.");
  }
};
</script>

<style scoped>
.track-list { padding: 20px; max-width: 800px; margin: 0 auto; }
.track-item { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-radius: 8px; transition: 0.2s; margin-bottom: 8px; }
.track-item:hover { background: #282828; }
.track-main { display: flex; align-items: center; flex: 1; cursor: pointer; min-width: 0; }
.cover-wrapper { width: 50px; height: 50px; margin-right: 15px; flex-shrink: 0; border-radius: 4px; overflow: hidden; background: #333; }
.cover { width: 100%; height: 100%; object-fit: cover; }
.info { flex: 1; min-width: 0; padding-right: 10px; }
.name { color: white; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist { color: #b3b3b3; font-size: 0.9em; }

.remove-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.5;
  transition: 0.2s;
}
.remove-btn:hover { opacity: 1; transform: scale(1.2); }

.playlist-select {
  background: transparent;
  color: #b3b3b3;
  border: 1px solid #444;
  border-radius: 20px;
  padding: 4px 8px;
  cursor: pointer;
  outline: none;
  font-size: 1.1rem;
  width: 35px;
  text-align: center;
}
.playlist-select:hover { border-color: #1db954; color: white; }
option { background: #181818; color: white; }
</style>