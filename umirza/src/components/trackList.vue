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
        <button class="add-btn" @click.stop="handleAddToPlaylist(track)" title="Kitaplığa Ekle">
          ➕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['tracks']);
const emit = defineEmits(['play']);

const handleAddToPlaylist = async (track) => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  
  if (!userData || !userData.id) {
    alert("Şarkı eklemek için giriş yapmalısın!");
    return;
  }

  try {
    const res = await fetch('https://my-spotify-player-tm8k.onrender.com/add-to-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: userData.id, 
        track: track 
      })
    });

    const data = await res.json();
    
    if (res.ok) {
      alert("Şarkı başarıyla eklendi! ✨");
    } else {
      alert(data.message || "Bir hata oluştu.");
    }
  } catch (err) {
    console.error("Ekleme hatası:", err);
    alert("Sunucuya bağlanılamadı.");
  }
};
</script>

<style scoped>
.track-list { padding: 20px; max-width: 800px; margin: 0 auto; }

.track-item { 
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  padding: 12px; 
  border-radius: 8px; 
  transition: 0.2s; 
  margin-bottom: 8px; 
}

.track-item:hover { background: #282828; }

.track-main { 
  display: flex; 
  align-items: center; 
  flex: 1; 
  cursor: pointer; 
  min-width: 0;
}

.cover-wrapper { width: 50px; height: 50px; margin-right: 15px; flex-shrink: 0; border-radius: 4px; overflow: hidden; background: #333; }
.cover { width: 100%; height: 100%; object-fit: cover; }

.info { flex: 1; min-width: 0; padding-right: 10px; }
.name { color: white; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist { color: #b3b3b3; font-size: 0.9em; }

.add-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.3;
  transition: 0.2s;
  color: white;
}

.track-item:hover .add-btn { opacity: 0.8; }
.add-btn:hover { opacity: 1 !important; transform: scale(1.2); color: #1db954; }
</style>