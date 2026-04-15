<template>
  <div class="player-bar" v-if="track">
    <div class="current-info">
      <img :src="track.youtubeThumb" class="playing-cover">
      <div class="meta">
        <strong class="track-name">{{ track.name }}</strong>
        <span class="track-artist">{{ track.artist }}</span>
      </div>
    </div>

    <div class="controls">
      <div class="main-buttons">
        <button @click="$emit('prev')" class="extra-btn">⏮️</button>
        
        <button @click="$emit('toggleReplay')" class="extra-btn" :class="{ active: isReplay }">↩️</button>
        
        <button @click="$emit('toggle')" class="play-btn">{{ isPlaying ? '⏸️' : '▶️' }}</button>
        
        <button @click="$emit('next')" class="extra-btn">⏭️</button>
        
        <button @click="$emit('toggleShuffle')" class="extra-btn" :class="{ active: isShuffle }">🔀</button>
        <button @click="$emit('toggleLike')" class="extra-btn" :class="{ active: isLiked }">❤</button>
      </div>
      
      <div class="progress-box">
        <span class="time-text">{{ formatTime(currentTime) }}</span>
        <input type="range" min="0" :max="duration" :value="currentTime" @input="$emit('seek', $event.target.value)" class="progress-slider">
        <span class="time-text">{{ formatTime(duration) }}</span>
      </div>
    </div>

    <div class="volume">
      <input type="range" min="0" max="100" :value="volume" @input="$emit('volumeChange', $event.target.value)" class="volume-slider">
    </div>
  </div>
</template>

<script setup>
defineProps(['track', 'isPlaying', 'currentTime', 'duration', 'volume', 'isReplay', 'isShuffle', 'isLiked']);
defineEmits(['next', 'toggle', 'prev', 'seek', 'volumeChange', 'toggleReplay', 'toggleShuffle', 'toggleLike']);

const formatTime = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
};
</script>

<style scoped>
/* CSS kodların aynı kalabilir, gayet güzeller. */
.player-bar { position: fixed; bottom: 0; left: 0; width: 100%; height: 90px; background-color: #181818; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-sizing: border-box; z-index: 1000; border-top: 1px solid #282828; }
.current-info { display: flex; align-items: center; gap: 12px; width: 30%; }
.playing-cover { width: 56px; height: 56px; border-radius: 4px; object-fit: cover; background: #282828; }
.meta { display: flex; flex-direction: column; color: white; }
.track-name { font-size: 14px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }
.track-artist { font-size: 12px; color: #b3b3b3; }
.controls { display: flex; flex-direction: column; align-items: center; width: 40%; gap: 8px; }
.main-buttons { display: flex; gap: 20px; align-items: center; }
.play-btn { background: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
.extra-btn { background: none; border: none; font-size: 1.2rem; cursor: pointer; opacity: 0.7; transition: 0.2s; }
.extra-btn:hover { opacity: 1; transform: scale(1.1); }
.extra-btn.active { opacity: 1; color: #1db954; }
.progress-box { width: 100%; display: flex; align-items: center; gap: 10px; color: #a7a7a7; font-size: 11px; }
.progress-slider { flex: 1; accent-color: #1db954; cursor: pointer; }
.volume { width: 30%; display: flex; justify-content: flex-end; }
.volume-slider { width: 100px; accent-color: #1db954; }
</style>