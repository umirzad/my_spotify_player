<template>
  <div class="track-list">
    <div v-for="track in tracks" :key="track.videoId" class="track-item" @click="$emit('play', track)">
      <div class="cover-wrapper">
        <img :src="track.youtubeThumb" class="cover" />
      </div>
      <div class="info">
        <div class="name">{{ track.name }}</div>
        <div class="artist">{{ track.artist }}</div>
      </div>
      <span class="play-icon">▶️</span>
    </div>
  </div>
</template>

<script setup>
defineProps(['tracks']);
defineEmits(['play']);
</script>

<style scoped>
/* Mevcut stillerin aynı kalsın */
.track-list { padding: 20px; max-width: 800px; margin: 0 auto; }
.track-item { display: flex; align-items: center; padding: 12px; border-radius: 8px; cursor: pointer; transition: 0.2s; margin-bottom: 8px; }
.track-item:hover { background: #282828; }
.cover-wrapper { width: 50px; height: 50px; margin-right: 15px; flex-shrink: 0; border-radius: 4px; overflow: hidden; background: #333; }
.cover { width: 100%; height: 100%; object-fit: cover; }
.info { flex: 1; min-width: 0; }
.name { color: white; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist { color: #b3b3b3; font-size: 0.9em; }
.play-icon { opacity: 0; font-size: 1.2rem; }
.track-item:hover .play-icon { opacity: 1; }
</style>